import { Badge, Group, Table, Text } from '@mantine/core';
import { formatNumber } from '../lib/format';
import AbilityColumns from './AbilityColumns';

// The table sizes cells to their narrowest content (one column of abilities), so
// this cell takes all spare width and never drops below two columns.
const ABILITIES_MIN_WIDTH = '25rem';

export default function GuardianForceRow({ guardianForce }) {
  const isRenamed = guardianForce.name !== guardianForce.defaultName;

  return (
    <Table.Tr c={guardianForce.isUnlocked ? undefined : 'dimmed'}>
      <Table.Th scope="row" fw={500}>
        <Group gap="xs" wrap="nowrap">
          <Text inherit>{guardianForce.name}</Text>
          {isRenamed && (
            <Text inherit c="dimmed" size="xs">
              ({guardianForce.defaultName})
            </Text>
          )}
          {!guardianForce.isUnlocked && (
            <Badge size="xs" color="gray" variant="outline">
              Locked
            </Badge>
          )}
        </Group>
      </Table.Th>
      <Table.Td>{formatNumber(guardianForce.experience)}</Table.Td>
      <Table.Td>{formatNumber(guardianForce.hitPoints)}</Table.Td>
      <Table.Td>{guardianForce.knockouts}</Table.Td>
      <Table.Td>{guardianForce.learning}</Table.Td>
      <Table.Td w="100%" miw={ABILITIES_MIN_WIDTH}>
        <AbilityColumns abilities={guardianForce.abilities} />
      </Table.Td>
    </Table.Tr>
  );
}
