// Self-check for the row model behind search and compare. Run with `npm test`.

import assert from 'node:assert/strict';
import { compareRows, filterRows, groupRowsByCategory } from './rows.js';
import { findArray, findField } from './savemapData.js';
import { SAVEMAP_BYTES } from './saveFile.js';

const before = new Uint8Array(SAVEMAP_BYTES);
const after = new Uint8Array(SAVEMAP_BYTES);
const gil = findField('Current Gil');
new DataView(after.buffer).setUint32(gil.offset, 1234, true);
const guardianForces = findArray('GF');
const unlocked = guardianForces.fields.find((field) => field.name === 'Unlocked');
const sirenOffset = guardianForces.offset + 3 * guardianForces.stride + unlocked.offset;
after[sirenOffset] = 1;

const rows = compareRows([before, after]);
const changed = filterRows(rows, { query: '', changedOnly: true });
assert.deepEqual(changed.map((row) => row.label).sort(), ['Current Gil', 'Siren · Unlocked']);
assert.deepEqual(changed.find((row) => row.label === 'Current Gil').values, ['0', '1234']);
assert.deepEqual(changed.find((row) => row.label === 'Siren · Unlocked').values, ['False', 'True']);

// Search matches labels, values and categories, case-insensitively.
assert.ok(
  filterRows(rows, { query: 'siren', changedOnly: false }).some(
    (row) => row.label === 'Siren · EXP',
  ),
);
assert.equal(filterRows(rows, { query: '1234', changedOnly: false }).length, 1);
assert.ok(filterRows(rows, { query: 'castle seals', changedOnly: false }).length > 0);
assert.equal(filterRows(rows, { query: 'no such field anywhere', changedOnly: false }).length, 0);

// Keys are unique, so rows line up one to one across saves.
assert.equal(new Set(rows.map((row) => row.key)).size, rows.length);

const groups = groupRowsByCategory(changed);
assert.deepEqual(
  groups.map((group) => group.title),
  ['General', 'GF - Roster'],
);

console.log('rows check passed');
