import { enumLabel, readArray, readField, setBitNumbers } from './fields.js';
import {
  ARRAY,
  CARD_COUNT_FIELD,
  CHARACTER_FIELD,
  CHARACTER_JUNCTIONS,
  FIELD,
  GUARDIAN_FORCE_FIELD,
  INVENTORY_FIELD,
  RARE_CARD_FIELD,
} from './fieldNames.js';
import {
  ABILITY_AP_COSTS,
  ENUMS,
  findArray,
  findField,
  GUARDIAN_FORCE_ABILITIES,
  requireValue,
} from './savemapData.js';

const EMPTY_PARTY_SLOT = 0xff;
const RARE_CARD_HELD_BY_PLAYER = 0xf0;
const CARD_COUNT_MASK = 0x7f;
const MAGIC_SLOT_COUNT = 32;
const COMMAND_SLOT_COUNT = 4;
const ABILITY_SLOT_COUNT = 4;
const STAT_MODIFIERS = ['HP', 'STR', 'VIT', 'MAG', 'SPR', 'SPD', 'LCK'];
// Compatibility is stored inverted; the menu shows (6000 - raw) / 5, truncated.
const COMPATIBILITY_CEILING = 6000;
const COMPATIBILITY_DIVISOR = 5;
const SEED_UNIFORM_MODEL = 1;
const ALREADY_LEARNED = 'already learned';
const NOTHING_SELECTED = 0;
const NO_SLOT = -1;

function readNamed(savemap, name) {
  return readField(savemap, findField(name));
}

function labelOr(enumName, value) {
  return enumLabel(enumName, value) ?? String(value);
}

function slotNumbers(count) {
  return Array.from({ length: count }, (_, index) => index + 1);
}

// e.g. "41/100": AP so far in the slot / the ability's cost.
function apProgress(apBySlot, slot, abilityId) {
  return `${apBySlot[slot]}/${ABILITY_AP_COSTS[abilityId]}`;
}

// The game (FUN_00497010) never clears the learning byte when the ability
// completes, so it can name one that's already learned.
function describeLearning(learningId, learnedIds, slotAbilities, apBySlot) {
  const name = labelOr('skillId', learningId);
  if (learningId === NOTHING_SELECTED) return name;
  if (learnedIds.includes(learningId)) return `${name} (${ALREADY_LEARNED})`;
  const slot = slotAbilities.indexOf(learningId);
  if (slot === NO_SLOT) return name;
  return `${name} (${apProgress(apBySlot, slot, learningId)})`;
}

// The GF's own ability table in slot order, then anything it learned another
// way (an item). Amnesia Greens set a "forgotten" bit per slot, not per ability id.
function listAbilities(learnedIds, slotAbilities, apBySlot, forgottenBytes) {
  const forgottenSlots = setBitNumbers(forgottenBytes);
  const learnable = slotAbilities
    .map((id, slot) => ({ id, slot }))
    .filter(({ id }) => id !== NOTHING_SELECTED);
  const learnableIds = learnable.map(({ id }) => id);
  const extra = learnedIds
    .filter((id) => !learnableIds.includes(id))
    .map((id) => ({ id, slot: NO_SLOT }));
  return [...learnable, ...extra].map(({ id, slot }) => {
    const isLearned = learnedIds.includes(id);
    const isForgotten = forgottenSlots.includes(slot);
    const hasProgress = !isLearned && !isForgotten && slot !== NO_SLOT;
    return {
      name: labelOr('skillId', id),
      isLearned,
      isForgotten,
      progress: hasProgress ? apProgress(apBySlot, slot, id) : undefined,
    };
  });
}

function buildGuardianForces(savemap) {
  return readArray(savemap, findArray(ARRAY.guardianForce)).map(({ instance, index, values }) => {
    const value = (name) => requireValue(values, name);
    const learnedIds = setBitNumbers(value(GUARDIAN_FORCE_FIELD.abilities));
    const slotAbilities = GUARDIAN_FORCE_ABILITIES[index];
    const learning = describeLearning(
      value(GUARDIAN_FORCE_FIELD.learning),
      learnedIds,
      slotAbilities,
      value(GUARDIAN_FORCE_FIELD.ap),
    );
    return {
      defaultName: instance,
      name: value(GUARDIAN_FORCE_FIELD.name),
      isUnlocked: value(GUARDIAN_FORCE_FIELD.unlocked) === 1,
      experience: value(GUARDIAN_FORCE_FIELD.experience),
      hitPoints: value(GUARDIAN_FORCE_FIELD.hitPoints),
      knockouts: value(GUARDIAN_FORCE_FIELD.knockouts),
      learning,
      abilities: listAbilities(
        learnedIds,
        slotAbilities,
        value(GUARDIAN_FORCE_FIELD.ap),
        value(GUARDIAN_FORCE_FIELD.forgotten),
      ),
    };
  });
}

function buildCharacters(savemap, guardianForces) {
  return readArray(savemap, findArray(ARRAY.character)).map(({ instance, values }) => {
    const value = (name) => requireValue(values, name);
    const magic = slotNumbers(MAGIC_SLOT_COUNT)
      .map((slot) => ({
        spell: labelOr('magicId', value(CHARACTER_FIELD.magicSpell(slot))),
        quantity: value(CHARACTER_FIELD.magicQuantity(slot)),
      }))
      .filter((slot) => slot.quantity > 0);
    const junctions = CHARACTER_JUNCTIONS.filter((junction) => value(junction.field) > 0).map(
      (junction) => ({ slot: junction.label, spell: labelOr('magicId', value(junction.field)) }),
    );
    const statModifiers = STAT_MODIFIERS.map((stat) => ({
      stat,
      value: value(CHARACTER_FIELD.statModifier(stat)),
    })).filter((modifier) => modifier.value > 0);
    const compatibility = guardianForces.map((guardianForce) => ({
      name: guardianForce.name,
      value: Math.trunc(
        (COMPATIBILITY_CEILING - value(CHARACTER_FIELD.compatibility(guardianForce.defaultName))) /
          COMPATIBILITY_DIVISOR,
      ),
    }));
    const skillNames = (slotName, count) =>
      slotNumbers(count)
        .map((slot) => value(slotName(slot)))
        .filter(Boolean)
        .map((id) => labelOr('skillId', id));

    return {
      name: instance,
      isInRoster: value(CHARACTER_FIELD.inRoster) === 1,
      isKnockedOut: value(CHARACTER_FIELD.knockedOut) === 1,
      isInSeedUniform: value(CHARACTER_FIELD.alternateModel) === SEED_UNIFORM_MODEL,
      currentHitPoints: value(CHARACTER_FIELD.hitPoints),
      experience: value(CHARACTER_FIELD.experience),
      weapon: labelOr('weaponId', value(CHARACTER_FIELD.weapon)),
      kills: value(CHARACTER_FIELD.kills),
      knockouts: value(CHARACTER_FIELD.knockouts),
      commands: skillNames(CHARACTER_FIELD.command, COMMAND_SLOT_COUNT),
      abilities: skillNames(CHARACTER_FIELD.ability, ABILITY_SLOT_COUNT),
      junctionedGuardianForces: setBitNumbers(value(CHARACTER_FIELD.junctionedGuardianForces))
        .filter((index) => index < guardianForces.length)
        .map((index) => guardianForces[index].name),
      junctions,
      statModifiers,
      compatibility,
      magic,
    };
  });
}

// The community storyId table lists checkpoints, not every value, so a save
// between two of them is described by the last one it has passed.
function describeStory(value) {
  const reached = Object.keys(ENUMS.storyId)
    .map(Number)
    .filter((checkpoint) => checkpoint <= value);
  if (reached.length === 0) return { value, text: undefined };
  const checkpoint = Math.max(...reached);
  const label = ENUMS.storyId[String(checkpoint)];
  return { value, text: checkpoint === value ? label : `Past: ${label}` };
}

function buildSummary(savemap, characters) {
  const party = FIELD.partyMembers
    .map((name) => readNamed(savemap, name))
    .filter((member) => member !== EMPTY_PARTY_SLOT)
    .map((member) => characters[member]?.name ?? String(member));

  return {
    names: FIELD.names.map((name) => ({ label: name, value: readNamed(savemap, name) })),
    disc: readNamed(savemap, FIELD.disc) + 1,
    playTimeSeconds: readNamed(savemap, FIELD.playTime),
    gil: readNamed(savemap, FIELD.gil),
    // The load screen shows Laguna's gil during the dream sequences.
    isLagunaPartyActive: readNamed(savemap, FIELD.lagunaPartyActive) === 1,
    lagunaGil: readNamed(savemap, FIELD.lagunaGil),
    seedPoints: readNamed(savemap, FIELD.seedPoints),
    saveCount: readNamed(savemap, FIELD.saveCount),
    story: describeStory(readNamed(savemap, FIELD.story)),
    location: labelOr('locationId', readNamed(savemap, FIELD.location)),
    field: labelOr('mapId', readNamed(savemap, FIELD.field)),
    party,
  };
}

function buildItems(savemap) {
  return readArray(savemap, findArray(ARRAY.inventory))
    .map(({ values }) => ({
      name: labelOr('itemId', requireValue(values, INVENTORY_FIELD.item)),
      count: requireValue(values, INVENTORY_FIELD.quantity),
    }))
    .filter((item) => item.count > 0);
}

function buildCards(savemap) {
  const regular = readArray(savemap, findArray(ARRAY.cardCount)).map(({ instance, values }) => ({
    name: instance,
    count: requireValue(values, CARD_COUNT_FIELD.count) & CARD_COUNT_MASK,
  }));
  const rare = readArray(savemap, findArray(ARRAY.rareCard)).map(({ instance, values }) => {
    const location = requireValue(values, RARE_CARD_FIELD.location);
    return { name: instance, isHeldByPlayer: location === RARE_CARD_HELD_BY_PLAYER, location };
  });
  return { regular, rare };
}

export function buildSaveModel(savemap) {
  const guardianForces = buildGuardianForces(savemap);
  const characters = buildCharacters(savemap, guardianForces);
  return {
    summary: buildSummary(savemap, characters),
    characters,
    guardianForces,
    items: buildItems(savemap),
    cards: buildCards(savemap),
  };
}
