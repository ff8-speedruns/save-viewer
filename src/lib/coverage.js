import { ROW_DEFINITIONS } from './rows.js';
import { SAVEMAP_BYTES } from './saveFile.js';

const BITS_PER_BYTE = 8;
const ALL_BITS = 0xff;
export const BYTES_PER_LINE = 16;

export const COVERAGE = { unmapped: 'unmapped', partial: 'partial', mapped: 'mapped' };

function byteLength(field) {
  if (field.kind === 'number') return field.size;
  return field.byteLength;
}

function buildByteMap() {
  const mappedBits = new Uint8Array(SAVEMAP_BYTES);
  const labels = Array.from({ length: SAVEMAP_BYTES }, () => []);
  const mark = (offset, bits, label) => {
    mappedBits[offset] |= bits;
    if (!labels[offset].includes(label)) labels[offset].push(label);
  };

  for (const definition of ROW_DEFINITIONS) {
    const { field, offset, label } = definition;
    if (field.kind === 'bits') {
      for (let bit = field.bit; bit < field.bit + field.bitLength; bit++) {
        mark(offset + Math.floor(bit / BITS_PER_BYTE), 1 << (bit % BITS_PER_BYTE), label);
      }
      continue;
    }
    for (let index = 0; index < byteLength(field); index++) mark(offset + index, ALL_BITS, label);
  }

  return { mappedBits, labels };
}

const BYTE_MAP = buildByteMap();

export function byteCoverage(offset) {
  const bits = BYTE_MAP.mappedBits[offset];
  if (bits === 0) return COVERAGE.unmapped;
  return bits === ALL_BITS ? COVERAGE.mapped : COVERAGE.partial;
}

export function byteLabels(offset) {
  return BYTE_MAP.labels[offset];
}

export const COVERAGE_COUNTS = Array.from({ length: SAVEMAP_BYTES }, (_, offset) =>
  byteCoverage(offset),
).reduce((counts, coverage) => ({ ...counts, [coverage]: (counts[coverage] ?? 0) + 1 }), {});

export function buildHexLines(savemaps) {
  const lineCount = Math.ceil(SAVEMAP_BYTES / BYTES_PER_LINE);
  return Array.from({ length: lineCount }, (_, lineIndex) => {
    const start = lineIndex * BYTES_PER_LINE;
    const end = Math.min(start + BYTES_PER_LINE, SAVEMAP_BYTES);
    const bytes = Array.from({ length: end - start }, (_, index) => {
      const offset = start + index;
      const values = savemaps.map((savemap) => savemap[offset]);
      return {
        offset,
        values,
        isChanged: values.some((value) => value !== values[0]),
        coverage: byteCoverage(offset),
        labels: byteLabels(offset),
      };
    });
    return {
      offset: start,
      bytes,
      hasUnmapped: bytes.some((byte) => byte.coverage !== COVERAGE.mapped),
      hasChanges: bytes.some((byte) => byte.isChanged),
    };
  });
}
