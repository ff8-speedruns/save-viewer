import { Table, Text } from '@mantine/core';
import { formatOffset } from '../lib/fields';

const CHANGED_BACKGROUND = 'var(--mantine-color-yellow-light)';
const CHANGED_WEIGHT = 700;

// Bold as well as highlighted, so a change doesn't rely on colour alone.
export default function RowsTableRow({ row, highlightChanges }) {
  const bit = row.field.kind === 'bits' ? `.${row.field.bit}` : '';
  const differsFromFirst = (value) => highlightChanges && value !== row.values[0];

  return (
    <Table.Tr>
      <Table.Td>
        <Text inherit>{row.label}</Text>
        {row.note && (
          <Text size="xs" c="dimmed" lineClamp={2}>
            {row.note}
          </Text>
        )}
      </Table.Td>
      {row.values.map((value, index) => (
        <Table.Td
          key={index}
          ff="monospace"
          bg={differsFromFirst(value) ? CHANGED_BACKGROUND : undefined}
          fw={differsFromFirst(value) ? CHANGED_WEIGHT : undefined}
        >
          {value}
        </Table.Td>
      ))}
      <Table.Td ff="monospace" c="dimmed">
        {formatOffset(row.offset)}
        {bit}
      </Table.Td>
    </Table.Tr>
  );
}
