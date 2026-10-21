const PAGE_LINES = 16;

function locate(lines, offset) {
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const column = lines[lineIndex].bytes.findIndex((byte) => byte.offset === offset);
    if (column !== -1) return { lineIndex, column };
  }
  return undefined;
}

function clampLine(lines, lineIndex) {
  return Math.min(Math.max(lineIndex, 0), lines.length - 1);
}

// Clamped, so the short last line still works.
function byteAt(lines, lineIndex, column) {
  const bytes = lines[clampLine(lines, lineIndex)].bytes;
  return bytes[Math.min(column, bytes.length - 1)].offset;
}

const MOVES = {
  ArrowLeft: (lines, { lineIndex, column }) => {
    const isFirstColumn = column === 0;
    if (isFirstColumn && lineIndex === 0) return byteAt(lines, lineIndex, column);
    return isFirstColumn
      ? byteAt(lines, lineIndex - 1, Infinity)
      : byteAt(lines, lineIndex, column - 1);
  },
  ArrowRight: (lines, { lineIndex, column }) => {
    const isLastColumn = column === lines[lineIndex].bytes.length - 1;
    const isLastLine = lineIndex === lines.length - 1;
    if (isLastColumn && isLastLine) return byteAt(lines, lineIndex, column);
    return isLastColumn ? byteAt(lines, lineIndex + 1, 0) : byteAt(lines, lineIndex, column + 1);
  },
  ArrowUp: (lines, { lineIndex, column }) => byteAt(lines, lineIndex - 1, column),
  ArrowDown: (lines, { lineIndex, column }) => byteAt(lines, lineIndex + 1, column),
  Home: (lines, { lineIndex }) => byteAt(lines, lineIndex, 0),
  End: (lines, { lineIndex }) => byteAt(lines, lineIndex, Infinity),
  PageUp: (lines, { lineIndex, column }) => byteAt(lines, lineIndex - PAGE_LINES, column),
  PageDown: (lines, { lineIndex, column }) => byteAt(lines, lineIndex + PAGE_LINES, column),
};

export function isNavigationKey(key) {
  return key in MOVES;
}

// A filter may have hidden the chosen byte; fall back to the first visible one.
export function resolveSelection(lines, offset) {
  if (lines.length === 0) return undefined;
  return locate(lines, offset) ? offset : lines[0].bytes[0].offset;
}

export function moveSelection(lines, offset, key) {
  const position = locate(lines, offset);
  if (!position) return resolveSelection(lines, offset);
  return MOVES[key](lines, position);
}
