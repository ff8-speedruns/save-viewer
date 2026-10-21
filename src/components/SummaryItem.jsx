import { Stack, Text } from '@mantine/core';

export default function SummaryItem({ label, children }) {
  return (
    <Stack gap={0}>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text size="sm" fw={500}>
        {children}
      </Text>
    </Stack>
  );
}
