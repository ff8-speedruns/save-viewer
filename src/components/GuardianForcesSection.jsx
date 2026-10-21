import { Table } from '@mantine/core';
import GuardianForceRow from './GuardianForceRow';

const TABLE_MIN_WIDTH = 820;

export default function GuardianForcesSection({ guardianForces }) {
  return (
    <Table.ScrollContainer minWidth={TABLE_MIN_WIDTH}>
      <Table fz="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>GF</Table.Th>
            <Table.Th>EXP</Table.Th>
            <Table.Th>HP</Table.Th>
            <Table.Th>KOs</Table.Th>
            <Table.Th>Learning</Table.Th>
            <Table.Th>Abilities</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {guardianForces.map((guardianForce) => (
            <GuardianForceRow key={guardianForce.defaultName} guardianForce={guardianForce} />
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
