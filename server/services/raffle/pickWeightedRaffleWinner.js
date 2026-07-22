import { randomInt } from "node:crypto";

/**
 * Взвешенный выбор: билет = ticketCount (сумма quantity покупок).
 * @param {Array<{ userId: string; ticketCount: number }>} entries
 * @param {{ randomIntFn?: (maxExclusive: number) => number }} [options]
 * @returns {string | null}
 */
export const pickWeightedRaffleWinnerUserId = (entries, options = {}) => {
  if (!Array.isArray(entries) || entries.length === 0) {
    return null;
  }

  const normalized = entries
    .map((entry) => ({
      userId: String(entry.userId ?? ""),
      ticketCount: Math.max(0, Math.floor(Number(entry.ticketCount) || 0)),
    }))
    .filter((entry) => entry.userId.length > 0 && entry.ticketCount > 0);

  if (normalized.length === 0) {
    return null;
  }

  const totalTickets = normalized.reduce((sum, entry) => sum + entry.ticketCount, 0);
  if (totalTickets <= 0) {
    return null;
  }

  const roll =
    typeof options.randomIntFn === "function"
      ? options.randomIntFn(totalTickets)
      : randomInt(totalTickets);

  let cursor = Number.isFinite(roll) ? Math.max(0, Math.floor(roll)) % totalTickets : 0;
  for (const entry of normalized) {
    if (cursor < entry.ticketCount) {
      return entry.userId;
    }
    cursor -= entry.ticketCount;
  }

  return normalized[normalized.length - 1].userId;
};
