import { Table, Text } from '@mantine/core';
import { bitListNames, formatField, formatOffset, readField } from '../lib/fields';
import BadgeList from './BadgeList';

export default function FieldRow({ field, savemap }) {
  const bit = field.kind === 'bits' ? `.${field.bit}` : '';
  const value = readField(savemap, field);
  const names = field.kind === 'text' ? undefined : bitListNames(field, value);

  return (
    <Table.Tr>
      <Table.Td>
        <Text inherit>{field.name}</Text>
        {field.note && (
          <Text size="xs" c="dimmed" lineClamp={2}>
            {field.note}
          </Text>
        )}
      </Table.Td>
      <Table.Td ff={names ? undefined : 'monospace'}>
        {names ? <BadgeList items={names} color="grape" /> : formatField(field, value)}
      </Table.Td>
      <Table.Td ff="monospace" c="dimmed">
        {formatOffset(field.offset)}
        {bit}
      </Table.Td>
    </Table.Tr>
  );
}
