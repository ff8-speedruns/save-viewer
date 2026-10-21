import { Table } from '@mantine/core';
import RegionRow from './RegionRow';

export default function RegionTable({ regions }) {
  return (
    <Table.ScrollContainer minWidth={560}>
      <Table verticalSpacing="xs" fz="sm" highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Region</Table.Th>
            <Table.Th>Trade rule</Table.Th>
            <Table.Th>Rules</Table.Th>
            <Table.Th>Ragnarok player</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {regions.map((region) => (
            <RegionRow key={region.id} region={region} />
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
