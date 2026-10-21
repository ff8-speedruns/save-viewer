import { GLYPHS } from './savemapData.js';

const END_OF_STRING = 0x00;

// Names the player typed in only use printable glyphs, so control codes aren't
// handled here. Anything unexpected shows as {xx} rather than being dropped.
export function decodeText(bytes) {
  let text = '';
  for (const byte of bytes) {
    if (byte === END_OF_STRING) break;
    text += GLYPHS[byte] ?? `{${byte.toString(16).padStart(2, '0')}}`;
  }
  return text;
}
