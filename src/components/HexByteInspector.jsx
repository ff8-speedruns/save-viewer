import { Anchor, Group, Paper, Stack, Text } from '@mantine/core';
import { COVERAGE } from '../lib/coverage';
import { formatHexWithDecimal, formatOffset } from '../lib/fields';

// Stays in view below the fixed 60px header while scrolling through the bytes.
const STICKY_TOP = 68;
const COVERAGE_TEXT = {
  [COVERAGE.mapped]: 'Mapped',
  [COVERAGE.partial]: 'Partly mapped (some of its bits)',
  [COVERAGE.unmapped]: 'Not in the memory map',
};

// aria-live: screen readers announce each new selection.
export default function HexByteInspector({ byte, fileNames, onFieldSearch }) {
  const isComparing = fileNames.length > 1;

  return (
    <Paper
      withBorder
      p="xs"
      pos="sticky"
      top={STICKY_TOP}
      style={{ zIndex: 1 }}
      aria-live="polite"
      aria-label="Selected byte"
    >
      <Stack gap={4}>
        <Group gap="md" wrap="wrap">
          <Text size="sm" fw={600} ff="monospace">
            {formatOffset(byte.offset)}
          </Text>
          {byte.values.map((value, index) => (
            <Text key={fileNames[index]} size="sm" ff="monospace">
              {isComparing && `${fileNames[index]}: `}
              {formatHexWithDecimal(value)}
            </Text>
          ))}
        </Group>
        <Text size="xs" c="dimmed">
          {COVERAGE_TEXT[byte.coverage]}
          {byte.labels.length > 0 && ': '}
          {byte.labels.map((label, index) => (
            <span key={label}>
              {index > 0 && ', '}
              <Anchor component="button" size="xs" onClick={() => onFieldSearch(label)}>
                {label}
              </Anchor>
            </span>
          ))}
        </Text>
      </Stack>
    </Paper>
  );
}
