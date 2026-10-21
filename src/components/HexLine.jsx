import { Fragment, memo } from 'react';
import { toHex } from '../lib/fields';
import { OFFSET_DIGITS } from '../constants';
import HexByte from './HexByte';

const OFFSET_STYLE = { color: 'var(--mantine-color-dimmed)', marginRight: '1.5ch' };
// A wider gap after the 8th byte, like most hex editors.
const HALF_LINE = 8;

// Memoised: `selectedOffset` is only set on the line holding the selection, so
// moving it re-renders two lines rather than all 315.
function HexLine({ line, selectedOffset, onSelect }) {
  return (
    <div role="row">
      <span role="rowheader" style={OFFSET_STYLE}>
        {toHex(line.offset, OFFSET_DIGITS)}
      </span>
      {line.bytes.map((byte, index) => (
        <Fragment key={byte.offset}>
          {index > 0 && (index === HALF_LINE ? '  ' : ' ')}
          <HexByte byte={byte} isSelected={byte.offset === selectedOffset} onSelect={onSelect} />
        </Fragment>
      ))}
    </div>
  );
}

export default memo(HexLine);
