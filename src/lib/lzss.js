// FF8's LZSS: 4 KB ring buffer starting at 4096 - 18, matches of 3-18 bytes.
// Unlike the textbook version, bytes outside what's been written read as zero.
const WINDOW_SIZE = 4096;
const WINDOW_MASK = WINDOW_SIZE - 1;
const MAX_MATCH_LENGTH = 18;
const MIN_MATCH_LENGTH = 3;
const FLAG_BITS_PER_BYTE = 8;

export function decompressLzss(input) {
  const window = new Uint8Array(WINDOW_SIZE);
  const output = [];
  let windowPosition = WINDOW_SIZE - MAX_MATCH_LENGTH;
  let position = 0;

  const emit = (byte) => {
    output.push(byte);
    window[windowPosition] = byte;
    windowPosition = (windowPosition + 1) & WINDOW_MASK;
  };

  while (position < input.length) {
    const flags = input[position++];
    for (let flagIndex = 0; flagIndex < FLAG_BITS_PER_BYTE; flagIndex++) {
      if (position >= input.length) break;

      const isLiteral = (flags >> flagIndex) & 1;
      if (isLiteral) {
        emit(input[position++]);
        continue;
      }

      if (position + 1 >= input.length) return Uint8Array.from(output);
      const low = input[position++];
      const high = input[position++];
      const matchStart = low | ((high & 0xf0) << 4);
      const matchLength = (high & 0x0f) + MIN_MATCH_LENGTH;
      for (let offset = 0; offset < matchLength; offset++) {
        emit(window[(matchStart + offset) & WINDOW_MASK]);
      }
    }
  }
  return Uint8Array.from(output);
}
