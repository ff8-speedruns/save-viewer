import { Card, Title } from '@mantine/core';
import { SCROLL_OFFSET_PIXELS, SECTION_TITLE_ATTRIBUTE } from '../constants';

// Card clips its content by default, which would also stop sticky content (the
// hex inspector) from following the page; nothing here needs the clipping.
const CARD_STYLE = { overflow: 'visible' };

export default function SectionCard({ id, title, children }) {
  return (
    <Card withBorder padding="md" component="section" aria-labelledby={id} style={CARD_STYLE}>
      <Title
        order={3}
        id={id}
        mb="sm"
        style={{ scrollMarginTop: SCROLL_OFFSET_PIXELS }}
        {...{ [SECTION_TITLE_ATTRIBUTE]: true }}
      >
        {title}
      </Title>
      {children}
    </Card>
  );
}
