const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const PERCENT_DECIMALS = 1;

export function formatPercent(probability) {
  return `${(probability * 100).toFixed(PERCENT_DECIMALS)}%`;
}

export function formatNumber(value) {
  return value.toLocaleString('en-US');
}

export function formatPlayTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / SECONDS_PER_HOUR);
  const minutes = Math.floor((totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  return `${hours}:${String(minutes).padStart(2, '0')}`;
}
