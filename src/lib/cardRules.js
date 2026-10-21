import {
  MAX_SOURCE_SCORE,
  NO_RULES_LABEL,
  QUEEN_OVERRIDE_THRESHOLD,
  REGIONS,
  RESET_COUNTER_WRAP,
  ROLL_RANGE,
  RULE_FLAGS,
  SPREAD_ROLL_DIVISOR,
  TRADE_RULE_NAMES,
  UNKNOWN_LABEL,
  VARIABLE,
} from '../constants.js';

// After every finished game the busiest region's trade rule spreads when
// score > roll / 25, onto one of the 8 regions picked at random. Each spread
// then adds roll / 32 (0-7) to the reset counter, setting it to 0 above 240,
// then resets a random region to One when roll < counter.
const RESET_COUNTER_STEPS = 8;

function findRegion(regionId) {
  return REGIONS.find((region) => region.id === regionId);
}

function tradeRuleName(tradeRule) {
  return TRADE_RULE_NAMES[tradeRule] ?? UNKNOWN_LABEL;
}

export function ruleNames(ruleBits) {
  const names = RULE_FLAGS.filter((flag) => ruleBits & flag.bit).map((flag) => flag.name);
  return names.length > 0 ? names : [NO_RULES_LABEL];
}

export function spreadChanceAtScore(score) {
  return Math.min(SPREAD_ROLL_DIVISOR * score, ROLL_RANGE) / ROLL_RANGE;
}

export function resetChancePerSpread(resetCounter) {
  let total = 0;
  for (let step = 0; step < RESET_COUNTER_STEPS; step++) {
    const counter = resetCounter + step;
    const wrapped = counter > RESET_COUNTER_WRAP ? 0 : counter;
    total += wrapped / ROLL_RANGE;
  }
  return total / RESET_COUNTER_STEPS;
}

// The score moves when you ask for the game, before the spread roll after it:
// +1 (max 10) for a busiest-region player, -1 for anyone else. Asking anyone
// else at 0 makes their region the busiest, still at 0.
function nextGameOdds(score, playsInSourceRegion) {
  const scoreAtRoll = playsInSourceRegion
    ? Math.min(score + 1, MAX_SOURCE_SCORE)
    : Math.max(score - 1, 0);
  const spreadChance = spreadChanceAtScore(scoreAtRoll);
  return { scoreAtRoll, spreadChance, perRegionChance: spreadChance / REGIONS.length };
}

export function decodeCardRules(save) {
  const read = save.readVariable;
  const score = read(VARIABLE.tradeSourceScore);
  const resetCounter = read(VARIABLE.resetCounter);
  const sourceRegionId = read(VARIABLE.tradeSourceRegion);
  const sourceRegion = findRegion(sourceRegionId);
  const queenRegion = findRegion(read(VARIABLE.queenRegion));
  const resetChance = resetChancePerSpread(resetCounter);

  const regions = REGIONS.map((region, index) => ({
    ...region,
    tradeRule: tradeRuleName(read(VARIABLE.regionTradeRuleFirst + index)),
    rules: ruleNames(read(VARIABLE.regionRulesFirst + index)),
    hasQueen: region === queenRegion,
    isBusiest: region.id === sourceRegionId,
  }));

  return {
    regions,
    // A new game doesn't set the Queen's region; she has none until the story places her.
    queen: queenRegion && {
      region: queenRegion.name,
      tradeRule: tradeRuleName(read(VARIABLE.queenTradeRule)),
      overrideChance: QUEEN_OVERRIDE_THRESHOLD / ROLL_RANGE,
    },
    tradeSpread: {
      sourceRegion: sourceRegion?.name ?? UNKNOWN_LABEL,
      // Only a valid region has a trade-rule variable; 0 or garbage would read another region's rules.
      sourceTradeRule: sourceRegion
        ? tradeRuleName(read(VARIABLE.regionTradeRuleFirst + sourceRegion.id - 1))
        : UNKNOWN_LABEL,
      score,
      resetCounter,
      inSourceRegion: nextGameOdds(score, true),
      elsewhere: nextGameOdds(score, false),
      resetChance,
      perRegionResetChance: resetChance / REGIONS.length,
    },
    // Empty until a region has been recorded (both are 0 in a new game).
    mixingHistory: [VARIABLE.recordedRegion, VARIABLE.previousRecordedRegion]
      .map((variable) => findRegion(read(variable))?.name)
      .filter(Boolean),
  };
}
