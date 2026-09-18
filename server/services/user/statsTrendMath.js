/** Окно тренда карточек «Подписчики» / «Продажи». */
export const STATS_TREND_WINDOW_HOURS = 24;
export const STATS_TREND_BUCKET_COUNT = 24;
export const STATS_TREND_WINDOW_MS = STATS_TREND_WINDOW_HOURS * 60 * 60 * 1000;

/**
 * @param {number} baseTotal
 * @param {number} currentTotal
 * @returns {number}
 */
export function computeStatsTrendPercentChange(baseTotal, currentTotal) {
  const base = Math.max(0, Math.floor(Number(baseTotal)) || 0);
  const current = Math.max(0, Math.floor(Number(currentTotal)) || 0);
  if (base <= 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - base) / base) * 100);
}

/**
 * Кумулятивный ряд и % за окно: base = current − eventsInWindow.
 *
 * @param {{
 *   currentTotal: number;
 *   eventTimestampsMs: number[];
 *   nowMs?: number;
 *   windowMs?: number;
 *   bucketCount?: number;
 * }} params
 */
export function buildStatsTrendSeries({
  currentTotal,
  eventTimestampsMs,
  nowMs = Date.now(),
  windowMs = STATS_TREND_WINDOW_MS,
  bucketCount = STATS_TREND_BUCKET_COUNT,
}) {
  const current = Math.max(0, Math.floor(Number(currentTotal)) || 0);
  const windowStart = nowMs - windowMs;
  const bucketMs = windowMs / bucketCount;
  const hourly = Array.from({ length: bucketCount }, () => 0);

  for (const rawTs of eventTimestampsMs) {
    const ts = Number(rawTs);
    if (!Number.isFinite(ts) || ts < windowStart || ts > nowMs) {
      continue;
    }
    let idx = Math.floor((ts - windowStart) / bucketMs);
    if (idx < 0) idx = 0;
    if (idx >= bucketCount) idx = bucketCount - 1;
    hourly[idx] += 1;
  }

  const eventsInWindow = hourly.reduce((sum, n) => sum + n, 0);
  const baseTotal = Math.max(0, current - eventsInWindow);
  /** @type {number[]} */
  const series = [];
  let running = baseTotal;
  for (let i = 0; i < bucketCount; i += 1) {
    running += hourly[i];
    series.push(running);
  }

  return {
    currentTotal: current,
    baseTotal,
    percentChange: computeStatsTrendPercentChange(baseTotal, current),
    series,
  };
}
