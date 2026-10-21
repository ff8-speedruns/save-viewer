import { COVERAGE } from '../lib/coverage';
import { toHex } from '../lib/fields';
import { HEX_BYTE_ID_PREFIX } from '../constants';

const STYLE_BY_COVERAGE = {
  [COVERAGE.mapped]: { color: 'var(--mantine-color-dimmed)' },
  [COVERAGE.partial]: { textDecoration: 'underline dotted' },
  [COVERAGE.unmapped]: { fontWeight: 700 },
};
// Bold and underline already mean unmapped and partly mapped, so a changed byte
// also gets an outline: the difference doesn't rely on colour alone.
const CHANGED_STYLE = {
  backgroundColor: 'var(--mantine-color-yellow-light)',
  outline: '1px solid var(--mantine-color-yellow-filled)',
};
const SELECTED_STYLE = {
  outline: '2px solid var(--mantine-primary-color-filled)',
  outlineOffset: 1,
  cursor: 'default',
};
const SELECTABLE_STYLE = { cursor: 'pointer' };

// One cell of the hex grid. Only the selected cell is in the tab order; the
// grid moves the selection with the arrow keys.
export default function HexByte({ byte, isSelected, onSelect }) {
  const style = {
    ...SELECTABLE_STYLE,
    ...STYLE_BY_COVERAGE[byte.coverage],
    ...(byte.isChanged && CHANGED_STYLE),
    ...(isSelected && SELECTED_STYLE),
  };

  return (
    <span
      id={`${HEX_BYTE_ID_PREFIX}${byte.offset}`}
      role="gridcell"
      tabIndex={isSelected ? 0 : -1}
      aria-selected={isSelected}
      style={style}
      onClick={() => onSelect(byte.offset)}
    >
      {toHex(byte.values[0])}
    </span>
  );
}
