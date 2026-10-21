// Self-check for keyboard movement in the hex grid. Run with `npm test`.

import assert from 'node:assert/strict';
import { isNavigationKey, moveSelection, resolveSelection } from './hexNavigation.js';

// Three visible lines: 0x00-0x0F, 0x20-0x2F (0x10 hidden by a filter), and a short 0x30-0x33.
const line = (start, length) => ({
  offset: start,
  bytes: Array.from({ length }, (_, index) => ({ offset: start + index })),
});
const lines = [line(0x00, 16), line(0x20, 16), line(0x30, 4)];
const move = (offset, key) => moveSelection(lines, offset, key);

assert.equal(move(0x05, 'ArrowRight'), 0x06);
assert.equal(move(0x0f, 'ArrowRight'), 0x20, 'the end of a line wraps to the next visible line');
assert.equal(move(0x20, 'ArrowLeft'), 0x0f, 'the start of a line wraps back');
assert.equal(move(0x00, 'ArrowLeft'), 0x00, 'nothing before the first byte');
assert.equal(move(0x33, 'ArrowRight'), 0x33, 'nothing after the last byte');
assert.equal(move(0x05, 'ArrowDown'), 0x25, 'down skips hidden lines');
assert.equal(move(0x2a, 'ArrowDown'), 0x33, 'down into a short line clamps the column');
assert.equal(move(0x05, 'ArrowUp'), 0x05, 'nothing above the first line');
assert.equal(move(0x25, 'Home'), 0x20);
assert.equal(move(0x25, 'End'), 0x2f);
assert.equal(move(0x31, 'PageUp'), 0x01);
assert.equal(move(0x01, 'PageDown'), 0x31);

assert.equal(
  resolveSelection(lines, 0x10),
  0x00,
  'a hidden selection falls back to the first byte',
);
assert.equal(resolveSelection(lines, 0x22), 0x22);
assert.equal(resolveSelection([], 0x22), undefined);
assert.ok(isNavigationKey('PageDown'));
assert.ok(!isNavigationKey('Enter'));

console.log('hex navigation check passed');
