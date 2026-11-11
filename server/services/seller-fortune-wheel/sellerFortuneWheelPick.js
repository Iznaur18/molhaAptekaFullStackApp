import { randomInt } from "node:crypto";

/**
 * Взвешенный выбор секции: шанс секции = её chancePercent из общей суммы
 * (на входе из контракта сумма всегда 100; для старых данных считаем по
 * фактической сумме). Секции с шансом 0 не выпадают никогда.
 *
 * @param {Array<{ chancePercent: number }>} sectors
 * @returns {number} индекс выпавшей секции
 */
export function pickFortuneWheelSectorIndex(sectors) {
  const weights = (Array.isArray(sectors) ? sectors : []).map((sector) =>
    Math.max(0, Math.floor(Number(sector?.chancePercent) || 0)),
  );
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  if (total <= 0) {
    return -1;
  }
  let ticket = randomInt(total);
  for (let index = 0; index < weights.length; index += 1) {
    ticket -= weights[index];
    if (ticket < 0) {
      return index;
    }
  }
  return weights.length - 1;
}
