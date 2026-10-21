/**
 * Self-check for the savemap readers. `npm test` runs the synthetic checks.
 *
 *   node src/lib/save.check.js [init.out] [save.ff8 ...]
 *
 * init.out (fs-exports/main.fs/init.out) is the game's new-game savemap from offset 0x50. The
 * expected values below come from INIT_OUT.md in FF8-Mining, decoded independently in Python.
 * Any .ff8 paths are decoded and summarised, to eyeball against the game.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import process from 'node:process';
import { formatField, readArray, readField } from './fields.js';
import { decodeText } from './text.js';
import { findArray, findField, GLYPHS, requireValue } from './savemapData.js';
import { parseSaveFile, SAVEMAP_BYTES } from './saveFile.js';
import { buildSaveModel } from './saveModel.js';
import { FIELD_DESCRIPTIONS } from './fieldDescriptions.js';
import { BIT_LIST_FIELDS, FIELD, VALUE_NAMES } from './fieldNames.js';

const glyphByCharacter = Object.fromEntries(
  Object.entries(GLYPHS)
    .filter(([, text]) => text.length === 1)
    .map(([byte, text]) => [text, Number(byte)]),
);
const encodeText = (text) => [...text].map((character) => glyphByCharacter[character]);

assert.equal(decodeText(Uint8Array.from([...encodeText('Squall'), 0, 0x45])), 'Squall');
assert.equal(decodeText(Uint8Array.from([0xe8, 0x01])), 'in{01}');

const savemap = new Uint8Array(SAVEMAP_BYTES);
const view = new DataView(savemap.buffer);
view.setUint16(0x10, 0xfffe, true);
savemap[0x20] = 0b1011_0000;
savemap[0x21] = 0b0000_0001;

const number = { kind: 'number', size: 2, offset: 0x10 };
assert.equal(readField(savemap, number), 0xfffe);
assert.equal(readField(savemap, { ...number, signed: true }), -2);
assert.equal(readField(savemap, { kind: 'bits', offset: 0x20, bit: 4, bitLength: 1 }), 1);
assert.equal(readField(savemap, { kind: 'bits', offset: 0x20, bit: 6, bitLength: 3 }), 0b110);
assert.deepEqual(readField(savemap, { kind: 'bytes', offset: 0x20, byteLength: 2 }), [0xb0, 0x01]);
assert.equal(formatField({ kind: 'number', size: 1, enum: 'itemId' }, 1), 'Potion (1)');
assert.equal(
  formatField({ kind: 'number', size: 1, enum: 'angeloAbility' }, 3),
  'Angelo Search (3)',
);
assert.equal(formatField({ kind: 'bits', bit: 0, bitLength: 1, enum: 'bool' }, 1), 'True');

const format = (name, value) => formatField(findField(name), value);

// Bit-list fields: bit n is entry firstId + n. Blizzard is magic id 4, so bit 3.
const drawn = { kind: 'bytes', name: 'Magic drawn once', byteLength: 8 };
assert.equal(formatField(drawn, [0b0000_1001, 0, 0, 0, 0, 0, 0, 0]), 'Fire, Blizzard');
assert.equal(formatField(drawn, [0, 0, 0, 0, 0, 0, 0, 0]), '-');
assert.equal(
  formatField({ kind: 'bytes', name: 'Rare cards obtained', byteLength: 5 }, [1, 0, 0, 0, 0]),
  'Chubby Chocobo',
);
for (const name of Object.keys(BIT_LIST_FIELDS)) assert.ok(findField(name));
assert.equal(
  format('Config flags', 0b11_0101),
  'ATB Wait, Cursor Memory, Controller Customize, bit 4',
);
assert.equal(format('Config flags', 0), 'ATB Active, Cursor Initial, Controller Normal');
for (const name of Object.keys(VALUE_NAMES)) assert.ok(findField(name));

for (const name of Object.keys(FIELD_DESCRIPTIONS)) assert.ok(findField(name));
assert.equal(format('Carried rules (last region)', 0x03), 'Open, Same (0x03)');
assert.equal(format('Card game rules (next game)', 0), 'No optional rules (0x00)');
assert.equal(format('Queen rule for sale', 0), 'Nothing for sale (0x00)');
assert.equal(format('Queen rule for sale', 0x04), 'Plus (0x04)');
assert.equal(format('Trade activity', 7), '7 of 10 (7)');
assert.equal(
  format('Trade drift-to-One counter', 138),
  '138 of 240, 55.3% chance a spread resets a region to One (138)',
);
assert.equal(format('Queen of Cards region', 0), 'None (0)');
assert.equal(format('Card game trade rule (next game)', 2), 'Diff (2)');

assert.equal(format('Caraway Code (on map 761)', 39), '039 (39)');
assert.equal(format('Current Disc', 3), 'Disc 4 (3)');
assert.equal(format('Current disc', 4), 'Disc 4 (4)');
assert.equal(format('SeeD payout popup timer', -1), 'Idle (-1)');
assert.equal(format('SeeD payout popup timer', 90), '90');
assert.equal(findField('SeeD payout popup timer').signed, true);

assert.equal(format('Party member 1', 1), 'Zell (1)');
assert.equal(format('Party member 3', 0xff), 'Empty (255)');
assert.equal(
  format('Swapped-out party (members)', [0, 0xff, 5]),
  'Squall, Empty, Selphie (00 FF 05)',
);
assert.equal(
  format('Field system flags', 0x241),
  'Laguna in party, Countdown shown, PHS locked off',
);
assert.equal(format('Field system flags', 0x80), 'bit 7');
assert.equal(format('Menu permissions', 0x01), 'Saving allowed, PHS blocked');
assert.equal(format('Field party entity index', 0xff), 'None (255)');
assert.equal(format('Countdown timer display position', [120, 8]), 'x 120, y 8 (78 08)');
const fade = new Array(24).fill(0);
fade[0] = 3;
fade[6] = 255;
fade[18] = 0xfb;
fade[19] = 0xff;
assert.match(
  format('Screen fade / tint state', fade),
  /^mode 3 \(fade out\); frames 0 \/ 0; RGB 255, 0, 0 to 0, 0, 0, step -5, 0, 0 /,
);

// Hex fields look their names up by hex value ("13", not "19").
assert.equal(format('CC Group Quest Progress', 0x13), 'CC Diamonds (0x13)');
assert.equal(format('CC Group Quest Progress', 0x1f), 'CC Hearts (0x1F)');
assert.equal(format('CC Quest final members (Kadowaki/King)', 0x09), 'CC King (complete) (0x09)');
assert.equal(format('Scan setting', 1), 'Always (1)');
assert.equal(format('ATB Wait mode', 0), 'Active (0)');
assert.equal(format('QUISTIS_BLUE_MAGIC_KNOWN', 0b1), 'Laser Eye');
assert.equal(
  format('ZELL_DUEL_MOVES_KNOWN', 0b1001111),
  'Punch Rush, Booya, Heel Drop, Mach Kick, Burning Rave',
);
assert.equal(
  format('SELPHIE_SLOT_SPECIALS_UNLOCKED', 0b100111),
  'Full-Cure, Wall, Rapture, The End',
);
assert.equal(format('ANGELO_COMPLETED', 0b10001), 'Angelo Rush, Angelo Cannon');
assert.equal(format('SG_ODIN_ANGEL_GILGA_FLAG', 0b1000_0010), 'Odin, bit 7');
assert.equal(formatField({ kind: 'number', size: 2, hex: true }, 0x2a), '0x002A (42)');
assert.equal(formatField({ kind: 'number', size: 1, enum: 'itemId' }, 250), '250');

// Building the model from an empty savemap reads every name in fieldNames.js;
// the lookups throw if the memory map no longer has one of them.
const emptyModel = buildSaveModel(new Uint8Array(SAVEMAP_BYTES));
assert.equal(emptyModel.characters.length, 8);
assert.equal(emptyModel.guardianForces.length, 16);
assert.throws(() => findField('No such field'), /no field named "No such field"/);
assert.throws(() => requireValue({ HP: 0 }, 'Max HP'), /no array field named "Max HP"/);
assert.equal(requireValue({ HP: 0 }, 'HP'), 0);

// During a Laguna dream the summary carries Laguna's gil as well as the party's.
const dream = new Uint8Array(SAVEMAP_BYTES);
const dreamView = new DataView(dream.buffer);
dreamView.setUint32(findField(FIELD.gil).offset, 43440, true);
dreamView.setUint32(findField(FIELD.lagunaGil).offset, 3000, true);
dream[findField(FIELD.lagunaPartyActive).offset] |= 1 << findField(FIELD.lagunaPartyActive).bit;
const dreamSummary = buildSaveModel(dream).summary;
assert.equal(dreamSummary.isLagunaPartyActive, true);
assert.equal(dreamSummary.lagunaGil, 3000);
assert.equal(dreamSummary.gil, 43440);
assert.equal(emptyModel.summary.isLagunaPartyActive, false);

// A GF whose learning byte names an ability it has already finished (the game
// doesn't clear it) says so, instead of listing it as in progress.
const learner = new Uint8Array(SAVEMAP_BYTES);
const gfArray = findArray('GF');
const fieldOffset = (name) => gfArray.fields.find((field) => field.name === name).offset;
const sirenBase = gfArray.offset + 3 * gfArray.stride;
learner[sirenBase + fieldOffset('Skill Selected to Learn')] = 28;
assert.equal(buildSaveModel(learner).guardianForces[3].learning, 'Treatment (0/100)');
// Treatment is slot 16 of Siren's kernel table; her AP for it is GF +0x24 + 16.
learner[sirenBase + fieldOffset('AP') + 16] = 41;
assert.equal(buildSaveModel(learner).guardianForces[3].learning, 'Treatment (41/100)');
learner[sirenBase + fieldOffset('Completed abilities') + 3] = 1 << 4;
assert.equal(buildSaveModel(learner).guardianForces[3].learning, 'Treatment (already learned)');
const sirenAbilities = buildSaveModel(learner).guardianForces[3].abilities;
assert.equal(sirenAbilities.find((ability) => ability.name === 'Treatment').progress, undefined);
assert.match(sirenAbilities.find((ability) => ability.name === 'Mag-J').progress, /^0\/\d+$/);
assert.equal(sirenAbilities.length, 21);
assert.deepEqual(
  sirenAbilities.filter((ability) => ability.isLearned).map((ability) => ability.name),
  ['Treatment'],
);
// Mag-J is slot 18 of Siren's table: byte 2, bit 2 of the forgotten flags.
learner[sirenBase + fieldOffset('Forgotten abilities') + 2] = 1 << 2;
const afterAmnesia = buildSaveModel(learner).guardianForces[3].abilities;
assert.deepEqual(
  afterAmnesia.filter((ability) => ability.isForgotten).map((ability) => ability.name),
  ['Mag-J'],
);
assert.equal(afterAmnesia.find((ability) => ability.name === 'Mag-J').progress, undefined);

console.log('savemap readers check passed');

const NEW_GAME_SAVEMAP_OFFSET = 0x50;
const [initOutPath, ...savePaths] = process.argv.slice(2);

if (initOutPath) {
  const newGame = new Uint8Array(SAVEMAP_BYTES);
  const initOut = readFileSync(initOutPath);
  newGame.set(
    initOut.subarray(0, SAVEMAP_BYTES - NEW_GAME_SAVEMAP_OFFSET),
    NEW_GAME_SAVEMAP_OFFSET,
  );

  const guardianForces = readArray(newGame, findArray('GF'));
  assert.equal(guardianForces[0].values.Name, 'Quezacotl');
  assert.equal(guardianForces[3].values.EXP, 1000);
  assert.equal(guardianForces[15].values.EXP, 29000);
  assert.equal(guardianForces[15].values.HP, 9999);
  assert.ok(guardianForces.every((guardianForce) => guardianForce.values.Unlocked === 0));

  const characters = readArray(newGame, findArray('Character'));
  assert.deepEqual(
    characters.map((character) => character.values['Weapon ID']),
    [0, 7, 11, 15, 19, 24, 28, 29],
  );
  assert.deepEqual(
    characters.map((character) => character.values['In roster']),
    [1, 0, 0, 0, 0, 0, 0, 0],
  );

  // The same facts through the model the page shows.
  const model = buildSaveModel(newGame);
  assert.deepEqual(
    model.characters.map((character) => character.weapon),
    ['Revolver', 'Metal Knuckle', 'Valiant', 'Chain Whip', 'Pinwheel', 'Flail', 'Hyperion', 'None'],
  );
  assert.equal(model.guardianForces[0].name, 'Quezacotl');
  assert.ok(model.guardianForces.every((guardianForce) => !guardianForce.isUnlocked));
  console.log('init.out check passed');
}

for (const path of savePaths) {
  const file = readFileSync(path);
  const save = parseSaveFile(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
  const show = (name) => formatField(findField(name), readField(save.savemap, findField(name)));
  console.log(path);
  for (const name of [
    "Squall's Name",
    'Current Disc',
    'Current Gil',
    'Play Time (IGT)',
    'Saved field',
  ]) {
    console.log(`  ${name}: ${show(name)}`);
  }
  const guardianForces = readArray(save.savemap, findArray('GF'));
  console.log(
    '  GFs:',
    guardianForces
      .map((guardianForce) => `${guardianForce.values.Name}=${guardianForce.values.Unlocked}`)
      .join(' '),
  );
}
