import { Badge, Group, Text } from '@mantine/core';
import { EMPTY_VALUE } from '../constants';

export default function BadgeList({ items, color = 'gray' }) {
  if (items.length === 0) {
    return (
      <Text size="sm" c="dimmed">
        {EMPTY_VALUE}
      </Text>
    );
  }

  return (
    <Group gap={4}>
      {items.map((item, index) => (
        <Badge key={`${item}-${index}`} color={color} variant="light" tt="none">
          {item}
        </Badge>
      ))}
    </Group>
  );
}
