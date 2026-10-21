// Run with `npm test`, or `node src/lib/cardRules.check.js <save.ff8>` to also print a real save.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import process from 'node:process';
import { decompressLzss } from './lzss.js';
import { parseSaveFile } from './saveFile.js';
import { decodeCardRules, resetChancePerSpread, spreadChanceAtScore } from './cardRules.js';
import { VARIABLE } from '../constants.js';

// LZSS: three literals, a back-reference to them, then a reference to the never-written
// (zero-filled) start of the window.
const lzssInput = Uint8Array.from([0x07, 0x41, 0x42, 0x43, 0xee, 0xf0, 0x00, 0x00]);
assert.deepEqual([...decompressLzss(lzssInput)], [0x41, 0x42, 0x43, 0x41, 0x42, 0x43, 0, 0, 0]);

// A literal-only LZSS stream is a 0xFF flag byte before every 8 bytes.
function compressAsLiterals(bytes) {
  const out = [];
  for (let start = 0; start < bytes.length; start += 8) {
    out.push(0xff, ...bytes.subarray(start, start + 8));
  }
  return Uint8Array.from(out);
}

function buildSave(variables, blockBytes = 0x2000) {
  const block = new Uint8Array(blockBytes);
  const savemap = block.subarray(0x180);
  savemap.set([0xff, 0x08], 2);
  for (const [variable, value] of Object.entries(variables))
    savemap[0xd60 + Number(variable)] = value;

  const compressed = compressAsLiterals(block);
  const file = new Uint8Array(4 + compressed.length);
  new DataView(file.buffer).setUint32(0, compressed.length, true);
  file.set(compressed, 4);
  return file.buffer;
}

const save = buildSave({
  [VARIABLE.regionRulesFirst]: 0x01, // Balamb: Open
  [VARIABLE.regionRulesFirst + 6]: 0xdf, // Lunar: everything but Retry
  [VARIABLE.regionTradeRuleFirst]: 2, // Balamb: Diff
  [VARIABLE.regionTradeRuleFirst + 2]: 1, // Trabia: One
  [VARIABLE.queenRegion]: 1,
  [VARIABLE.queenTradeRule]: 2,
  [VARIABLE.tradeSourceRegion]: 3,
  [VARIABLE.tradeSourceScore]: 10,
  [VARIABLE.resetCounter]: 138,
  [VARIABLE.recordedRegion]: 3,
  [VARIABLE.previousRecordedRegion]: 1,
});
const state = decodeCardRules(parseSaveFile(save));

assert.equal(state.regions[0].tradeRule, 'Diff');
assert.equal(state.regions[2].tradeRule, 'One');
assert.deepEqual(state.regions[0].rules, ['Open']);
assert.equal(state.regions[6].rules.length, 7);
assert.equal(state.regions[0].hasQueen, true);
assert.equal(state.queen.region, 'Balamb');
assert.equal(state.queen.tradeRule, 'Diff');
assert.equal(state.tradeSpread.sourceRegion, 'Trabia');
assert.equal(state.tradeSpread.sourceTradeRule, 'One');
assert.equal(state.regions[2].isBusiest, true);
assert.equal(state.regions.filter((region) => region.isBusiest).length, 1);
assert.deepEqual(state.mixingHistory, ['Trabia', 'Balamb']);

// New-game state: no Queen region yet.
const newGame = decodeCardRules(parseSaveFile(buildSave({ [VARIABLE.tradeSourceRegion]: 1 })));
assert.equal(newGame.queen, undefined);
assert.equal(newGame.regions.filter((region) => region.hasQueen).length, 0);
assert.deepEqual(newGame.mixingHistory, []);

// A busiest-region byte that isn't a region must not read another region's variable.
const corrupt = decodeCardRules(parseSaveFile(buildSave({ [VARIABLE.tradeSourceRegion]: 0 })));
assert.equal(corrupt.tradeSpread.sourceRegion, 'Unknown');
assert.equal(corrupt.tradeSpread.sourceTradeRule, 'Unknown');

// Score 10 stays 10 in the busiest region: 250/256. Elsewhere it drops to 9 first: 225/256.
assert.equal(state.tradeSpread.inSourceRegion.spreadChance, 250 / 256);
assert.equal(state.tradeSpread.elsewhere.spreadChance, 225 / 256);
assert.equal(state.tradeSpread.elsewhere.perRegionChance, 225 / 256 / 8);
assert.equal(spreadChanceAtScore(0), 0);

// Counter 138 plus 0-7 never wraps, so the reset chance is the mean of 138..145 over 256.
assert.equal(resetChancePerSpread(138), 141.5 / 256);
// Counter 238 plus 0-7: 238, 239, 240 count; 241-245 wrap to 0.
assert.equal(resetChancePerSpread(238), (238 + 239 + 240) / 8 / 256);

assert.throws(() => parseSaveFile(new Uint8Array([1, 0, 0, 0]).buffer));
// A size prefix that matches but decompresses short of a full 8 KB block.
assert.throws(() => parseSaveFile(buildSave({}, 0x1000)), /size/);

console.log('card rules check passed');

const realSavePath = process.argv[2];
if (realSavePath) {
  const file = readFileSync(realSavePath);
  const real = decodeCardRules(
    parseSaveFile(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength)),
  );
  console.log(JSON.stringify(real, null, 2));
}
