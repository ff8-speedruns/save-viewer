import { useEffect, useMemo } from 'react';
import { Stack, Text } from '@mantine/core';
import { compareRows, filterRows, groupRowsByCategory } from '../lib/rows';
import RowsTable from './RowsTable';
import SectionCard from './SectionCard';

export default function RowsView({ saves, query, isChangedOnly, onRendered }) {
  useEffect(() => onRendered(), [onRendered]);
  const rows = useMemo(() => compareRows(saves.map((save) => save.savemap)), [saves]);
  const groups = useMemo(
    () => groupRowsByCategory(filterRows(rows, { query, changedOnly: isChangedOnly })),
    [rows, query, isChangedOnly],
  );
  const fileNames = saves.map((save) => save.fileName);

  if (groups.length === 0) {
    return <Text c="dimmed">No fields match.</Text>;
  }

  return (
    <Stack gap="lg">
      {groups.map((group) => (
        <SectionCard key={group.id} id={group.id} title={`${group.title} (${group.rows.length})`}>
          <RowsTable rows={group.rows} fileNames={fileNames} />
        </SectionCard>
      ))}
    </Stack>
  );
}
