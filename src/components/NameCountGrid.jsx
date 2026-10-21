import { Group, SimpleGrid, Text } from '@mantine/core';
import { EMPTY_VALUE } from '../constants';

const GRID_COLUMNS = { base: 1, xs: 2, sm: 3, lg: 4 };

export default function NameCountGrid({ entries }) {
  if (entries.length === 0) {
    return (
      <Text size="sm" c="dimmed">
        {EMPTY_VALUE}
      </Text>
    );
  }

  return (
    <SimpleGrid cols={GRID_COLUMNS} spacing="md" verticalSpacing={2}>
      {entries.map((entry, index) => (
        <Group key={`${entry.name}-${index}`} justify="space-between" gap="xs" wrap="nowrap">
          <Text size="sm" truncate>
            {entry.name}
          </Text>
          <Text size="sm" fw={500} c={entry.isMuted ? 'dimmed' : undefined}>
            {entry.count}
          </Text>
        </Group>
      ))}
    </SimpleGrid>
  );
}
