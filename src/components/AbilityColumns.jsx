import { Box, Text } from '@mantine/core';
import { EMPTY_VALUE } from '../constants';

// CSS columns fill down first, then across.
const COLUMNS_STYLE = { columnWidth: '12rem', columnGap: 'var(--mantine-spacing-md)' };
const LEARNED_WEIGHT = 700;
const FORGOTTEN_TITLE = 'Forgotten';

export default function AbilityColumns({ abilities }) {
  if (abilities.length === 0) {
    return (
      <Text size="sm" c="dimmed">
        {EMPTY_VALUE}
      </Text>
    );
  }

  return (
    <Box style={COLUMNS_STYLE}>
      {abilities.map((ability, index) => (
        <Text
          key={`${ability.name}-${index}`}
          size="sm"
          truncate
          fw={ability.isLearned ? LEARNED_WEIGHT : undefined}
          fs={ability.isLearned ? undefined : 'italic'}
          c={ability.isLearned ? undefined : 'dimmed'}
          td={ability.isForgotten ? 'line-through' : undefined}
          title={ability.isForgotten ? FORGOTTEN_TITLE : undefined}
        >
          {ability.name}
          {ability.progress && ` (${ability.progress})`}
        </Text>
      ))}
    </Box>
  );
}
