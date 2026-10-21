import { Table, Text } from '@mantine/core';
import { MAX_SOURCE_SCORE, RESET_COUNTER_WRAP, RESET_TRADE_RULE } from '../constants';
import { formatPercent } from '../lib/format';
import TradeRuleBadge from './TradeRuleBadge';

export default function TradeSpreadSummary({ tradeSpread }) {
  const {
    sourceRegion,
    sourceTradeRule,
    score,
    resetCounter,
    inSourceRegion,
    elsewhere,
    resetChance,
    perRegionResetChance,
  } = tradeSpread;

  const rows = [
    { opponent: `A ${sourceRegion} player`, odds: inSourceRegion },
    { opponent: 'Anyone else', odds: elsewhere },
  ];

  return (
    <div>
      <Text size="sm">
        Busiest region: <strong>{sourceRegion}</strong> (trade rule{' '}
        <TradeRuleBadge tradeRule={sourceTradeRule} />
        ), score{' '}
        <strong>
          {score}/{MAX_SOURCE_SCORE}
        </strong>
        . Reset counter{' '}
        <strong>
          {resetCounter}/{RESET_COUNTER_WRAP}
        </strong>
        .
      </Text>
      <Text size="sm" mt="xs">
        After your next finished card game, {sourceRegion}&apos;s{' '}
        <TradeRuleBadge tradeRule={sourceTradeRule} /> may be copied to one random region:
      </Text>
      <Table.ScrollContainer minWidth={400}>
        <Table verticalSpacing="xs" fz="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Next game against</Table.Th>
              <Table.Th>Chance it copies</Table.Th>
              <Table.Th>Chance for each region</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map(({ opponent, odds }) => (
              <Table.Tr key={opponent}>
                <Table.Td>{opponent}</Table.Td>
                <Table.Td>{formatPercent(odds.spreadChance)}</Table.Td>
                <Table.Td>{formatPercent(odds.perRegionChance)}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
      <Text size="sm" mt="xs">
        Each copy then has a {formatPercent(resetChance)} chance of resetting a random region to{' '}
        <TradeRuleBadge tradeRule={RESET_TRADE_RULE} /> ({formatPercent(perRegionResetChance)} for
        each region).
      </Text>
    </div>
  );
}
