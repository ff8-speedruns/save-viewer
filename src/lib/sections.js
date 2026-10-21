import { CATEGORY_ORDER, FIELDS } from './savemapData.js';

export function slug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function pinnedRank(category) {
  const rank = CATEGORY_ORDER.indexOf(category);
  return rank === -1 ? Infinity : rank;
}

// The toml's pinned categories first, then the rest alphabetically.
export function compareCategories(first, second) {
  return pinnedRank(first) - pinnedRank(second) || first.localeCompare(second);
}

// One generic section per memory-map category that has savemap fields.
export const FIELD_CATEGORY_SECTIONS = [...new Set(FIELDS.map((field) => field.category))]
  .sort(compareCategories)
  .map((category) => ({
    id: `category-${slug(category)}`,
    title: category,
    fields: FIELDS.filter((field) => field.category === category),
  }));
