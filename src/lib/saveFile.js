import { decompressLzss } from './lzss.js';
import { ERRORS } from '../constants.js';

// A PC .ff8 slot save is a little-endian u32 compressed length, then LZSS data.
// Decompressed it's one 8 KB PSX memory-card block: a 0x180-byte header (title,
// icon), then the 0x13A4-byte savemap, then zero padding. The savemap's bytes
// 2-3 are always 0xFF 0x08.
const LENGTH_PREFIX_BYTES = 4;
const SAVE_BLOCK_BYTES = 0x2000;
const MEMORY_CARD_HEADER_BYTES = 0x180;
export const SAVEMAP_BYTES = 0x13a4;
const SAVEMAP_MARKER_OFFSET = 2;
const SAVEMAP_MARKER = [0xff, 0x08];
const FIELD_VARIABLES_OFFSET = 0xd60;

export function parseSaveFile(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  if (bytes.length < LENGTH_PREFIX_BYTES) throw new Error(ERRORS.wrongSize);

  const view = new DataView(arrayBuffer);
  const compressedLength = view.getUint32(0, true);
  if (compressedLength + LENGTH_PREFIX_BYTES !== bytes.length) throw new Error(ERRORS.wrongSize);

  const block = decompressLzss(bytes.subarray(LENGTH_PREFIX_BYTES));
  if (block.length !== SAVE_BLOCK_BYTES) throw new Error(ERRORS.wrongSize);

  const savemap = block.subarray(
    MEMORY_CARD_HEADER_BYTES,
    MEMORY_CARD_HEADER_BYTES + SAVEMAP_BYTES,
  );
  const hasMarker = SAVEMAP_MARKER.every(
    (byte, index) => savemap[SAVEMAP_MARKER_OFFSET + index] === byte,
  );
  if (!hasMarker) throw new Error(ERRORS.notGameSave);

  return {
    savemap,
    readVariable: (variable) => savemap[FIELD_VARIABLES_OFFSET + variable],
  };
}
