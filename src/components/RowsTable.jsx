import { Table } from '@mantine/core';
import RowsTableRow from './RowsTableRow';

const LABEL_COLUMN_WIDTH = 280;
const VALUE_COLUMN_WIDTH = 200;
const OFFSET_COLUMN_WIDTH = 110;
const SINGLE_VALUE_HEADER = 'Value';

export default function RowsTable({ rows, fileNames }) {
  const isComparing = fileNames.length > 1;
  const valueHeaders = isComparing ? fileNames : [SINGLE_VALUE_HEADER];
  const minWidth =
    LABEL_COLUMN_WIDTH + valueHeaders.length * VALUE_COLUMN_WIDTH + OFFSET_COLUMN_WIDTH;

  return (
    <Table.ScrollContainer minWidth={minWidth}>
      <Table fz="sm" layout="fixed">
        <Table.Thead>
          <Table.Tr>
            <Table.Th w={LABEL_COLUMN_WIDTH}>Field</Table.Th>
            {valueHeaders.map((header) => (
              <Table.Th key={header}>{header}</Table.Th>
            ))}
            <Table.Th w={OFFSET_COLUMN_WIDTH}>Offset</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((row) => (
            <RowsTableRow key={row.key} row={row} highlightChanges={isComparing} />
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
