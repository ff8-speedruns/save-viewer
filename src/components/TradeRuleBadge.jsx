import { Badge } from '@mantine/core';
import { TRADE_RULE_NAMES } from '../constants';

const DIFF_TRADE_RULE = TRADE_RULE_NAMES[2];

export default function TradeRuleBadge({ tradeRule }) {
  return (
    // A span, so it can sit inside a Text paragraph.
    <Badge
      component="span"
      color={tradeRule === DIFF_TRADE_RULE ? 'green' : 'gray'}
      variant="light"
    >
      {tradeRule}
    </Badge>
  );
}
