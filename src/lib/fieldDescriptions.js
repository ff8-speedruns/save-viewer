// Shown as "description (raw value)".
import { resetChancePerSpread, ruleNames } from './cardRules.js';
import { formatPercent } from './format.js';
import { findArray } from './savemapData.js';
import { MAX_SOURCE_SCORE, RESET_COUNTER_WRAP } from '../constants.js';

const NOTHING_FOR_SALE = 'Nothing for sale';
const EMPTY_PARTY_SLOT = 0xff;
const FADE_OUT_MODE = 3;
const RGB_CHANNELS = 3;
const CARAWAY_CODE_DIGITS = 3;
const CHARACTER_NAMES = findArray('Character').instances;

const describeRules = (ruleBits) => ruleNames(ruleBits).join(', ');

const describeCharacter = (index) =>
  index === EMPTY_PARTY_SLOT ? 'Empty' : (CHARACTER_NAMES[index] ?? `Character ${index}`);

// var +0xD8..+0xEF: a u16 mode (3 = fade out), two u16 frame counters, then
// RGB start / end / step as signed 16-bit words.
function describeScreenFade(bytes) {
  const view = new DataView(Uint8Array.from(bytes).buffer);
  const word = (index) => view.getInt16(index * 2, true);
  const rgb = (firstWord) =>
    Array.from({ length: RGB_CHANNELS }, (_, channel) => word(firstWord + channel)).join(', ');
  const mode = word(0);
  const modeText = mode === FADE_OUT_MODE ? `mode ${mode} (fade out)` : `mode ${mode}`;
  return `${modeText}; frames ${word(1)} / ${word(2)}; RGB ${rgb(3)} to ${rgb(6)}, step ${rgb(9)}`;
}

export const FIELD_DESCRIPTIONS = {
  // The save header's disc is 0-based (disc 4 = 3); the script variable is 1-based.
  'Current Disc': (index) => `Disc ${index + 1}`,
  'Current disc': (disc) => `Disc ${disc}`,
  'Caraway Code (on map 761)': (code) => String(code).padStart(CARAWAY_CODE_DIGITS, '0'),
  'Party member 1': describeCharacter,
  'Party member 2': describeCharacter,
  'Party member 3': describeCharacter,
  'Swapped-out party (members)': (indexes) => indexes.map(describeCharacter).join(', '),
  'Countdown timer display position': ([x, y]) => `x ${x}, y ${y}`,
  'Screen fade / tint state': describeScreenFade,
  'Carried rules (last region)': describeRules,
  'Carried rules (second last region)': describeRules,
  'Card game rules (next game)': describeRules,
  'Queen rule for sale': (ruleBit) => (ruleBit === 0 ? NOTHING_FOR_SALE : describeRules(ruleBit)),
  'Trade activity': (score) => `${score} of ${MAX_SOURCE_SCORE}`,
  'Trade drift-to-One counter': (counter) =>
    `${counter} of ${RESET_COUNTER_WRAP}, ${formatPercent(resetChancePerSpread(counter))} chance a spread resets a region to One`,
};
