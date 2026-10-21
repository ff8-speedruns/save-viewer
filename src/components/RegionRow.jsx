import { Badge, Group, Table, Text } from '@mantine/core';
import { EMPTY_VALUE } from '../constants';
import TradeRuleBadge from './TradeRuleBadge';

export default function RegionRow({ region }) {
  return (
    <Table.Tr>
      <Table.Th scope="row" fw={500}>
        <Group gap="xs" wrap="nowrap">
          <Text inherit>
            {region.id}. {region.name}
          </Text>
          {region.isBusiest && (
            <Badge size="xs" color="blue">
              busiest
            </Badge>
          )}
          {region.hasQueen && (
            <Badge size="xs" color="grape">
              Queen
            </Badge>
          )}
        </Group>
      </Table.Th>
      <Table.Td>
        <TradeRuleBadge tradeRule={region.tradeRule} />
      </Table.Td>
      <Table.Td>{region.rules.join(', ')}</Table.Td>
      <Table.Td c="dimmed">{region.ragnarokPlayer ?? EMPTY_VALUE}</Table.Td>
    </Table.Tr>
  );
}
