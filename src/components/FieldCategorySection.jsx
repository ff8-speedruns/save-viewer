import { Table } from '@mantine/core';
import FieldRow from './FieldRow';

const TABLE_MIN_WIDTH = 560;

export default function FieldCategorySection({ fields, savemap }) {
  return (
    <Table.ScrollContainer minWidth={TABLE_MIN_WIDTH}>
      <Table fz="sm" layout="fixed">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Field</Table.Th>
            <Table.Th w="35%">Value</Table.Th>
            <Table.Th w={110}>Offset</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {fields.map((field) => (
            <FieldRow
              key={`${field.offset}-${field.bit ?? ''}-${field.name}`}
              field={field}
              savemap={savemap}
            />
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
