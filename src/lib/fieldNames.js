// Memory-map names the hand-built sections read. A rename in addresses.toml
// needs the same rename here; `npm test` fails if one goes missing.

export const FIELD = {
  names: ["Squall's Name", "Rinoa's Name", "Angelo's Name", "Boko's Name", "Griever's Name"],
  disc: 'Current Disc',
  playTime: 'Play Time (IGT)',
  gil: 'Current Gil',
  lagunaGil: "Laguna's Gil",
  lagunaPartyActive: "Laguna's party active",
  seedPoints: 'SeeD Pts',
  saveCount: 'Save count',
  story: 'Story Progress',
  location: 'Save preview location id',
  field: 'Saved field',
  partyMembers: ['Party member 1', 'Party member 2', 'Party member 3'],
};

export const ARRAY = {
  guardianForce: 'GF',
  character: 'Character',
  inventory: 'Inventory item',
  cardCount: 'Card count',
  rareCard: 'Rare card location',
};

export const GUARDIAN_FORCE_FIELD = {
  name: 'Name',
  unlocked: 'Unlocked',
  experience: 'EXP',
  hitPoints: 'HP',
  knockouts: 'KOs',
  learning: 'Skill Selected to Learn',
  abilities: 'Completed abilities',
  ap: 'AP',
  forgotten: 'Forgotten abilities',
};

export const CHARACTER_FIELD = {
  hitPoints: 'HP',
  experience: 'EXP Earned (Affects Level)',
  weapon: 'Weapon ID',
  kills: 'Kill Counter',
  knockouts: 'KO Counter',
  inRoster: 'In roster',
  knockedOut: 'KO status',
  alternateModel: 'Alternate model',
  junctionedGuardianForces: 'Junctioned GFs',
  magicSpell: (slot) => `Magic Slot ${slot} Spell ID`,
  magicQuantity: (slot) => `Magic Slot ${slot} Quantity`,
  command: (slot) => `Equipped Command ${slot}`,
  ability: (slot) => `Equipped Skill ${slot}`,
  statModifier: (stat) => `${stat} Modifier`,
  compatibility: (guardianForce) => `${guardianForce} Compatibility`,
};

export const CHARACTER_JUNCTIONS = [
  ...['HP', 'STR', 'VIT', 'MAG', 'SPR', 'SPD', 'EVA', 'HIT', 'LCK'].map((stat) => ({
    label: stat,
    field: `${stat} Junction Spell`,
  })),
  { label: 'Elem-Atk', field: 'Junction Elm. Atk.' },
  { label: 'ST-Atk', field: 'Junction St. Atk.' },
  ...[1, 2, 3, 4].map((slot) => ({
    label: `Elem-Def ${slot}`,
    field: `Junction Elm. Def. ${slot}`,
  })),
  ...[1, 2, 3, 4].map((slot) => ({ label: `ST-Def ${slot}`, field: `Junction St. Def. ${slot}` })),
];

export const INVENTORY_FIELD = { item: 'Item ID', quantity: 'Quantity' };
export const CARD_COUNT_FIELD = { count: 'Count' };
export const RARE_CARD_FIELD = { location: 'Location' };

// Bit n names entry `firstId + n` of an enum, or `names[n]`. Ammo and Slot
// specials are offset into the item and magic lists (FUN_0048d200).
export const BIT_LIST_FIELDS = {
  'Magic drawn once': { enum: 'magicId', firstId: 1 },
  'Rare cards obtained': { enum: 'cardId', firstId: 77 },
  QUISTIS_BLUE_MAGIC_KNOWN: { enum: 'blueMagic', firstId: 0 },
  ZELL_DUEL_MOVES_KNOWN: { enum: 'duelMove', firstId: 0 },
  IRVINE_AMMO_UNLOCKED: { enum: 'itemId', firstId: 101 },
  SELPHIE_SLOT_SPECIALS_UNLOCKED: { enum: 'magicId', firstId: 51 },
  ANGELO_COMPLETED: { enum: 'angeloAbility', firstId: 0 },
  ANGELO_KNOWN: { enum: 'angeloAbility', firstId: 0 },
  SG_ODIN_ANGEL_GILGA_FLAG: {
    names: ['Dream (Laguna)', 'Odin', 'Phoenix', 'Gilgamesh', 'Angelo disabled', 'Angel Wing'],
  },
  // Named after the field-script opcodes that set them (ADDMEMBER, SALARYDISPON, BATTLECUT, ...).
  'Field system flags': {
    names: {
      0: 'Laguna in party',
      1: 'Kiros in party',
      2: 'Ward in party',
      3: 'SeeD salary off',
      4: 'Salary popup off',
      5: 'Battles off',
      6: 'Countdown shown',
      8: 'Movies cut',
      9: 'PHS locked off',
      10: 'Music change pending',
      12: 'Rank popup off',
    },
  },
  // SAVEENABLE / PHSENABLE; both cleared on field entry.
  'Menu permissions': {
    states: [
      { bit: 0, clear: 'Saving blocked', set: 'Saving allowed' },
      { bit: 1, clear: 'PHS blocked', set: 'PHS allowed' },
    ],
  },
  // Bit 4 is set in some saves; its meaning is unknown.
  'Config flags': {
    states: [
      { bit: 0, clear: 'ATB Active', set: 'ATB Wait' },
      { bit: 2, clear: 'Cursor Initial', set: 'Cursor Memory' },
      { bit: 5, clear: 'Controller Normal', set: 'Controller Customize' },
    ],
  },
};

// A list is indexed by value; an object names only some values.
export const VALUE_NAMES = {
  'Field party entity index': { 255: 'None' },
  'SeeD payout popup timer': { '-1': 'Idle' },
  'ATB Wait mode': ['Active', 'Wait'],
  'Cursor Memory': ['Initial', 'Memory'],
  'Controller Customize': ['Normal', 'Customize'],
  'Scan setting': ['Once', 'Always'],
};
