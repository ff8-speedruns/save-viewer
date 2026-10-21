import { TableOfContents } from '@mantine/core';
import { SCROLL_OFFSET_PIXELS, SECTION_TITLE_ATTRIBUTE } from '../constants';

const SCROLL_SPY_OPTIONS = {
  selector: `[${SECTION_TITLE_ATTRIBUTE}]`,
  getDepth: () => 1,
  offset: SCROLL_OFFSET_PIXELS,
};

export default function SectionNav({ onPick }) {
  return (
    <TableOfContents
      variant="light"
      size="sm"
      radius="sm"
      scrollSpyOptions={SCROLL_SPY_OPTIONS}
      getControlProps={({ data }) => ({
        children: data.value,
        onClick: () => {
          data.getNode().scrollIntoView({ behavior: 'smooth' });
          onPick();
        },
      })}
    />
  );
}
