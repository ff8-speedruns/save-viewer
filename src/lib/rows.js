import { formatField, readField } from './fields.js';
import { ARRAYS, FIELDS } from './savemapData.js';
import { compareCategories, slug } from './sections.js';

const LABEL_SEPARATOR = ' · ';

// Keyed by savemap position, so rows from different saves line up.
export const ROW_DEFINITIONS = [
  ...FIELDS.map((field) => ({
    key: `${field.offset}.${field.bit ?? ''}.${field.name}`,
    category: field.category,
    label: field.name,
    note: field.note,
    field,
    baseOffset: 0,
    offset: field.offset,
  })),
  ...ARRAYS.flatMap((array) =>
    Array.from({ length: array.count }, (_, index) => {
      const baseOffset = array.offset + index * array.stride;
      const instance = array.instances[index] ?? `${array.name} ${index + 1}`;
      return array.fields.map((field) => ({
        key: `${array.name}.${index}.${field.offset}.${field.bit ?? ''}.${field.name}`,
        category: array.category,
        label: `${instance}${LABEL_SEPARATOR}${field.name}`,
        note: field.note,
        field,
        baseOffset,
        offset: baseOffset + field.offset,
      }));
    }).flat(),
  ),
];

export function compareRows(savemaps) {
  return ROW_DEFINITIONS.map((definition) => {
    const values = savemaps.map((savemap) =>
      formatField(definition.field, readField(savemap, definition.field, definition.baseOffset)),
    );
    return { ...definition, values, isChanged: values.some((value) => value !== values[0]) };
  });
}

export function filterRows(rows, { query, changedOnly }) {
  const needle = query.trim().toLowerCase();
  return rows.filter((row) => {
    if (changedOnly && !row.isChanged) return false;
    if (!needle) return true;
    const haystack = [row.category, row.label, ...row.values].join('\n').toLowerCase();
    return haystack.includes(needle);
  });
}

export function groupRowsByCategory(rows) {
  const categories = [...new Set(rows.map((row) => row.category))].sort(compareCategories);
  return categories.map((category) => ({
    id: `rows-${slug(category)}`,
    title: category,
    rows: rows.filter((row) => row.category === category),
  }));
}
