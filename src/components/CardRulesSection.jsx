import { Stack, Text } from '@mantine/core';
import QueenSummary from './QueenSummary';
import RegionTable from './RegionTable';
import TradeSpreadSummary from './TradeSpreadSummary';

export default function CardRulesSection({ cardRules }) {
  return (
    <Stack gap="sm">
      <RegionTable regions={cardRules.regions} />
      <TradeSpreadSummary tradeSpread={cardRules.tradeSpread} />
      <QueenSummary queen={cardRules.queen} />
      <Text size="sm" c="dimmed">
        Rule-mixing history:{' '}
        {cardRules.mixingHistory.length > 0
          ? `${cardRules.mixingHistory.join(', then ')}.`
          : 'none recorded yet.'}
      </Text>
    </Stack>
  );
}
