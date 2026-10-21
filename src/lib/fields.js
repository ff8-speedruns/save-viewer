import { FIELD_DESCRIPTIONS } from './fieldDescriptions.js';
import { BIT_LIST_FIELDS, VALUE_NAMES } from './fieldNames.js';
import { ENUMS } from './savemapData.js';
import { decodeText } from './text.js';
import { EMPTY_VALUE, OFFSET_DIGITS } from '../constants.js';

const BITS_PER_BYTE = 8;
const BYTE_MASK = 0xff;
const HEX_RADIX = 16;
const LARGEST_NUMBER_BYTES = 4;
// True/False flags: the name says it all, "True (1)" would add nothing.
const FLAG_ENUM = 'bool';

const NUMBER_READERS = {
  1: { unsigned: 'getUint8', signed: 'getInt8' },
  2: { unsigned: 'getUint16', signed: 'getInt16' },
  4: { unsigned: 'getUint32', signed: 'getInt32' },
};

function readBits(savemap, offset, bit, bitLength) {
  const byteCount = Math.ceil((bit + bitLength) / BITS_PER_BYTE);
  let packed = 0;
  for (let index = byteCount - 1; index >= 0; index--) {
    packed = packed * (BYTE_MASK + 1) + savemap[offset + index];
  }
  return Math.floor(packed / 2 ** bit) % 2 ** bitLength;
}

// `baseOffset` is where the field's struct starts: 0, or an array element's start.
export function readField(savemap, field, baseOffset = 0) {
  const offset = baseOffset + field.offset;
  const view = new DataView(savemap.buffer, savemap.byteOffset, savemap.byteLength);

  if (field.kind === 'number') {
    const readers = NUMBER_READERS[field.size];
    return view[field.signed ? readers.signed : readers.unsigned](offset, true);
  }
  if (field.kind === 'bits') return readBits(savemap, offset, field.bit, field.bitLength);
  if (field.kind === 'text') return decodeText(savemap.subarray(offset, offset + field.byteLength));
  return Array.from(savemap.subarray(offset, offset + field.byteLength));
}

export function enumLabel(enumName, value) {
  return ENUMS[enumName]?.[String(value)];
}

export function toHex(value, digits = 2) {
  return value.toString(HEX_RADIX).toUpperCase().padStart(digits, '0');
}

export function formatOffset(offset) {
  return `0x${toHex(offset, OFFSET_DIGITS)}`;
}

function numberToBytes(value, size) {
  return Array.from(
    { length: size },
    (_, index) => (value >>> (index * BITS_PER_BYTE)) & BYTE_MASK,
  );
}

function unnamedBit(bitNumber) {
  return `bit ${bitNumber}`;
}

function bitLabel(list, bitNumber) {
  if (list.names) return list.names[bitNumber] ?? unnamedBit(bitNumber);
  const id = list.firstId + bitNumber;
  return enumLabel(list.enum, id) ?? String(id);
}

// Bit numbers that are set, counting from bit 0 of the first byte. Numbers are
// little-endian, so a number and its bytes give the same answer.
export function setBitNumbers(value) {
  const bytes = Array.isArray(value) ? value : numberToBytes(value, LARGEST_NUMBER_BYTES);
  const bitIndexes = Array.from({ length: BITS_PER_BYTE }, (_, bit) => bit);
  return bytes.flatMap((byte, byteIndex) =>
    bitIndexes.filter((bit) => (byte >> bit) & 1).map((bit) => byteIndex * BITS_PER_BYTE + bit),
  );
}

// Undefined for a field that isn't a bit list. A `states` list names every known
// bit's current state, set or not, then any other set bit.
export function bitListNames(field, value) {
  const list = BIT_LIST_FIELDS[field.name];
  if (!list) return undefined;
  const setBits = setBitNumbers(value);
  if (!list.states) return setBits.map((bitNumber) => bitLabel(list, bitNumber));

  const knownBits = list.states.map((state) => state.bit);
  const states = list.states.map((state) =>
    setBits.includes(state.bit) ? state.set : state.clear,
  );
  const unknown = setBits.filter((bitNumber) => !knownBits.includes(bitNumber)).map(unnamedBit);
  return [...states, ...unknown];
}

export function formatField(field, value) {
  if (field.kind === 'text') return value;
  const names = bitListNames(field, value);
  if (names) return names.length > 0 ? names.join(', ') : EMPTY_VALUE;
  const valueName = VALUE_NAMES[field.name]?.[value];
  if (valueName !== undefined) return `${valueName} (${value})`;
  const describe = FIELD_DESCRIPTIONS[field.name];
  if (describe) return `${describe(value)} (${rawNumber(field, value)})`;
  if (field.kind === 'bytes') return value.map((byte) => toHex(byte)).join(' ');

  const label = field.enum ? enumLabel(field.enum, enumKey(field, value)) : undefined;
  if (label !== undefined && field.enum === FLAG_ENUM) return label;
  if (label !== undefined) return `${label} (${rawNumber(field, value)})`;
  if (field.hex) return formatHexWithDecimal(value, (field.size ?? 1) * 2);
  return String(value);
}

// A hex field's name list is keyed by its hex value ("1F"), as in the Cheat
// Engine table; every other list by the decimal value.
function enumKey(field, value) {
  return field.hex ? toHex(value, (field.size ?? 1) * 2) : String(value);
}

function rawNumber(field, value) {
  if (Array.isArray(value)) return value.map((byte) => toHex(byte)).join(' ');
  return field.hex ? `0x${toHex(value, (field.size ?? 1) * 2)}` : String(value);
}

export function formatHexWithDecimal(value, digits = 2) {
  return `0x${toHex(value, digits)} (${value})`;
}

export function readArray(savemap, array) {
  return Array.from({ length: array.count }, (_, index) => {
    const offset = array.offset + index * array.stride;
    const values = Object.fromEntries(
      array.fields.map((field) => [field.name, readField(savemap, field, offset)]),
    );
    return { instance: array.instances[index] ?? `#${index + 1}`, index, values };
  });
}
