import { Stack, Text } from '@mantine/core';
import { formatHexWithDecimal } from '../lib/fields';
import NameCountGrid from './NameCountGrid';

const HELD_BY_PLAYER = 'Yours';

export default function CardsSection({ cards }) {
  const regular = cards.regular.map((card) => ({
    name: card.name,
    count: card.count,
    isMuted: card.count === 0,
  }));
  const rare = cards.rare.map((card) => ({
    name: card.name,
    count: card.isHeldByPlayer ? HELD_BY_PLAYER : formatHexWithDecimal(card.location),
    isMuted: !card.isHeldByPlayer,
  }));

  return (
    <Stack gap="md">
      <Text size="xs" c="dimmed">
        Levels 1-7: how many you hold
      </Text>
      <NameCountGrid entries={regular} />
      <Text size="xs" c="dimmed">
        Rare cards (levels 8-10): who holds each one. Values other than yours are the holder&apos;s
        raw id.
      </Text>
      <NameCountGrid entries={rare} />
    </Stack>
  );
}
