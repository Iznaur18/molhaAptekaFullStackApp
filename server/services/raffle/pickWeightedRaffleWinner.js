import { randomInt } from "node:crypto";

/**
 * @param {Array<{ userId: string; ticketCount: number }>} entries
 */
const normalizeTicketEntries = (entries) => {
  if (!Array.isArray(entries)) {
    return [];
  }
  return entries
    .map((entry) => ({
      userId: String(entry.userId ?? ""),
      ticketCount: Math.max(0, Math.floor(Number(entry.ticketCount) || 0)),
    }))
    .filter((entry) => entry.userId.length > 0 && entry.ticketCount > 0);
};

/**
 * Взвешенный выбор без повторов: билет = ticketCount (сумма quantity покупок).
 * Один участник может выиграть только один раз. Если участников меньше, чем
 * `count`, вернётся столько победителей, сколько есть участников.
 * @param {Array<{ userId: string; ticketCount: number }>} entries
 * @param {number} count
 * @param {{ randomIntFn?: (maxExclusive: number) => number }} [options]
 * @returns {string[]}
 */
export const pickWeightedRaffleWinnersUserIds = (entries, count, options = {}) => {
  const pool = normalizeTicketEntries(entries);
  const target = Math.max(0, Math.floor(Number(count) || 0));
  const winners = [];

  while (pool.length > 0 && winners.length < target) {
    const totalTickets = pool.reduce((sum, entry) => sum + entry.ticketCount, 0);
    if (totalTickets <= 0) {
      break;
    }

    const roll =
      typeof options.randomIntFn === "function"
        ? options.randomIntFn(totalTickets)
        : randomInt(totalTickets);

    let cursor = Number.isFinite(roll)
      ? Math.max(0, Math.floor(roll)) % totalTickets
      : 0;
    let pickedIndex = pool.length - 1;
    for (let index = 0; index < pool.length; index += 1) {
      if (cursor < pool[index].ticketCount) {
        pickedIndex = index;
        break;
      }
      cursor -= pool[index].ticketCount;
    }

    winners.push(pool[pickedIndex].userId);
    pool.splice(pickedIndex, 1);
  }

  return winners;
};

/**
 * Взвешенный выбор: билет = ticketCount (сумма quantity покупок).
 * @param {Array<{ userId: string; ticketCount: number }>} entries
 * @param {{ randomIntFn?: (maxExclusive: number) => number }} [options]
 * @returns {string | null}
 */
export const pickWeightedRaffleWinnerUserId = (entries, options = {}) => {
  return pickWeightedRaffleWinnersUserIds(entries, 1, options)[0] ?? null;
};
