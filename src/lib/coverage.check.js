// Self-check for the savemap coverage map behind the hex view. Run with `npm test`.

import assert from 'node:assert/strict';
import { buildHexLines, byteCoverage, byteLabels, COVERAGE, COVERAGE_COUNTS } from './coverage.js';
import { findArray, findField } from './savemapData.js';
import { SAVEMAP_BYTES } from './saveFile.js';

// A 4-byte number covers all four of its bytes.
const gil = findField('Current Gil');
for (let index = 0; index < 4; index++) {
  assert.equal(byteCoverage(gil.offset + index), COVERAGE.mapped);
  assert.ok(byteLabels(gil.offset + index).includes('Current Gil'));
}

// Array elements are covered at their own offset: Siren's EXP.
const guardianForces = findArray('GF');
const experience = guardianForces.fields.find((field) => field.name === 'EXP');
const sirenExperience = guardianForces.offset + 3 * guardianForces.stride + experience.offset;
assert.ok(byteLabels(sirenExperience).includes('Siren · EXP'));

// GF byte +0x10 isn't in the memory map.
assert.equal(byteCoverage(guardianForces.offset + 0x10), COVERAGE.unmapped);

// A byte with only some bits mapped is partial: character "In roster" is bit 0 of +0x94.
const characters = findArray('Character');
assert.equal(byteCoverage(characters.offset + 0x94), COVERAGE.partial);

const total = Object.values(COVERAGE_COUNTS).reduce((sum, count) => sum + count, 0);
assert.equal(total, SAVEMAP_BYTES);

const before = new Uint8Array(SAVEMAP_BYTES);
const after = new Uint8Array(SAVEMAP_BYTES);
after[0x60] = 7;
const lines = buildHexLines([before, after]);
assert.equal(lines.length, Math.ceil(SAVEMAP_BYTES / 16));
assert.deepEqual(
  lines.filter((line) => line.hasChanges).map((line) => line.offset),
  [0x60],
);
assert.deepEqual(lines[6].bytes[0].values, [0, 7]);

console.log('coverage check passed', COVERAGE_COUNTS);
