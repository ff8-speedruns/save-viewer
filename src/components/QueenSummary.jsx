import { Text, Title } from '@mantine/core';
import { formatPercent } from '../lib/format';
import TradeRuleBadge from './TradeRuleBadge';

export default function QueenSummary({ queen }) {
  return (
    <div>
      <Title order={5}>Queen of Cards</Title>
      {queen ? (
        <Text size="sm">
          In <strong>{queen.region}</strong> with trade rule{' '}
          <TradeRuleBadge tradeRule={queen.tradeRule} />. Each time you ask a {queen.region} card
          player for a game, there&apos;s a {formatPercent(queen.overrideChance)} chance{' '}
          {queen.region}&apos;s trade rule becomes <TradeRuleBadge tradeRule={queen.tradeRule} />.
          Her own trade rule can change each time you challenge her.
        </Text>
      ) : (
        <Text size="sm">Not placed in any region yet.</Text>
      )}
    </div>
  );
}
