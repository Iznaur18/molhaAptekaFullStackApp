const MOSCOW_TIME_ZONE = "Europe/Moscow";

/**
 * Offset Moscow wall-clock → UTC for a UTC-guess instant (handles DST).
 * @param {Date} date
 * @returns {number}
 */
const getMoscowOffsetMs = (date) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: MOSCOW_TIME_ZONE,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);

  const map = Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
  );

  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour) % 24,
    Number(map.minute),
    Number(map.second),
  );

  return asUtc - date.getTime();
};

/**
 * @param {number} year
 * @param {number} month 1–12
 * @param {number} day
 * @param {number} hour
 * @param {number} minute
 * @param {number} second
 * @returns {Date}
 */
export const moscowWallTimeToUtc = (year, month, day, hour = 0, minute = 0, second = 0) => {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second);
  const offset = getMoscowOffsetMs(new Date(utcGuess));
  return new Date(utcGuess - offset);
};

/**
 * Календарный месяц Europe/Moscow → [startUtc, endUtc).
 * @param {Date} [referenceDate]
 * @returns {{ startUtc: Date; endUtc: Date; year: number; month: number }}
 */
export const resolveMoscowCalendarMonthUtcRange = (referenceDate = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: MOSCOW_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(referenceDate);

  const map = Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
  );

  const year = Number(map.year);
  const month = Number(map.month);
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  return {
    startUtc: moscowWallTimeToUtc(year, month, 1, 0, 0, 0),
    endUtc: moscowWallTimeToUtc(nextYear, nextMonth, 1, 0, 0, 0),
    year,
    month,
  };
};
