import { SimpleGrid } from '@mantine/core';
import { EMPTY_VALUE } from '../constants';
import { formatNumber, formatPlayTime } from '../lib/format';
import SummaryItem from './SummaryItem';

const GRID_COLUMNS = { base: 1, xs: 2, md: 4 };

export default function SummarySection({ summary }) {
  return (
    <SimpleGrid cols={GRID_COLUMNS} spacing="md" verticalSpacing="sm">
      <SummaryItem label="Disc">{summary.disc}</SummaryItem>
      <SummaryItem label="Play time">{formatPlayTime(summary.playTimeSeconds)}</SummaryItem>
      {summary.isLagunaPartyActive && (
        <SummaryItem label="Laguna's gil (dream sequence)">
          {formatNumber(summary.lagunaGil)}
        </SummaryItem>
      )}
      <SummaryItem label={summary.isLagunaPartyActive ? "Squall's party gil" : 'Gil'}>
        {formatNumber(summary.gil)}
      </SummaryItem>
      <SummaryItem label="SeeD points">{formatNumber(summary.seedPoints)}</SummaryItem>
      <SummaryItem label="Save count">{summary.saveCount}</SummaryItem>
      <SummaryItem label="Party">{summary.party.join(', ') || EMPTY_VALUE}</SummaryItem>
      <SummaryItem label="Location">{summary.location}</SummaryItem>
      <SummaryItem label="Field">{summary.field}</SummaryItem>
      <SummaryItem label={`Story progress (${summary.story.value})`}>
        {summary.story.text ?? EMPTY_VALUE}
      </SummaryItem>
      {summary.names.map((name) => (
        <SummaryItem key={name.label} label={name.label}>
          {name.value || EMPTY_VALUE}
        </SummaryItem>
      ))}
    </SimpleGrid>
  );
}
