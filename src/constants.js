export const REGIONS = [
  { id: 1, name: 'Balamb', ragnarokPlayer: 'Jack' },
  { id: 2, name: 'Galbadia', ragnarokPlayer: null },
  { id: 3, name: 'Trabia', ragnarokPlayer: 'Diamond twins' },
  { id: 4, name: 'Centra', ragnarokPlayer: 'Joker' },
  { id: 5, name: 'Dollet', ragnarokPlayer: 'Club' },
  { id: 6, name: 'FH', ragnarokPlayer: 'Xu' },
  { id: 7, name: 'Lunar', ragnarokPlayer: 'Quistis' },
  { id: 8, name: 'Esthar', ragnarokPlayer: 'two Esthar players' },
];

export const TRADE_RULE_NAMES = { 1: 'One', 2: 'Diff', 3: 'Direct', 4: 'All' };
export const RESET_TRADE_RULE = TRADE_RULE_NAMES[1];

export const RULE_FLAGS = [
  { bit: 0x01, name: 'Open' },
  { bit: 0x02, name: 'Same' },
  { bit: 0x04, name: 'Plus' },
  { bit: 0x08, name: 'Random' },
  { bit: 0x10, name: 'Sudden Death' },
  { bit: 0x20, name: 'Retry' },
  { bit: 0x40, name: 'Same Wall' },
  { bit: 0x80, name: 'Elemental' },
];

export const UNKNOWN_LABEL = 'Unknown';
export const NO_RULES_LABEL = 'No optional rules';

// Savemap field variables (byte-sized), read straight from the save.
export const VARIABLE = {
  regionRulesFirst: 272,
  regionTradeRuleFirst: 280,
  recordedRegion: 290,
  previousRecordedRegion: 291,
  queenRegion: 295,
  tradeSourceRegion: 296,
  tradeSourceScore: 297,
  resetCounter: 298,
  queenTradeRule: 299,
};

// Odds from the rule controller's script in-game
export const ROLL_RANGE = 256;
export const MAX_SOURCE_SCORE = 10;
export const SPREAD_ROLL_DIVISOR = 25;
export const RESET_COUNTER_WRAP = 240;
export const QUEEN_OVERRIDE_THRESHOLD = 90;

export const ERRORS = {
  wrongSize: "That doesn't look like an FF8 PC save (bad filesize).",
  notGameSave:
    "That file isn't a game save slot. Use a slotN_saveNN.ff8 file, not chocorpg.ff8 or a settings file.",
  unreadable: 'Could not read file.',
  tooLarge: 'That file is far too big to be an FF8 save (saves are a few KB).',
};

// Real saves are 2-9 KB compressed. Anything this big is rejected before reading it.
export const MAX_SAVE_FILE_BYTES = 64 * 1024;

export const SAVE_FILE_EXTENSION = '.ff8';

// Section headings carry this attribute so the sidebar's scroll spy can find them.
export const SECTION_TITLE_ATTRIBUTE = 'data-section-title';
// ToolShell's header is fixed and 60px tall; headings need to land below it.
export const SCROLL_OFFSET_PIXELS = 76;

export const HAND_BUILT_SECTIONS = [
  { id: 'summary', title: 'Summary' },
  { id: 'characters', title: 'Characters' },
  { id: 'guardian-forces', title: 'Guardian Forces' },
  { id: 'items', title: 'Items' },
  { id: 'cards', title: 'Cards' },
  { id: 'card-rules', title: 'Card rules' },
];

export const EMPTY_VALUE = '-';

// Savemap offsets are under 0x13A4, so four hex digits.
export const OFFSET_DIGITS = 4;

// More saves than this switch with a dropdown instead of tabs.
export const MAX_SEGMENTED_SAVES = 3;

// Search runs this long after the last keystroke, not on every key.
export const SEARCH_DEBOUNCE_MILLISECONDS = 250;

// Each hex cell's element id is this plus its savemap offset, so the grid can move focus.
export const HEX_BYTE_ID_PREFIX = 'hex-byte-';
