import { randomInt } from "node:crypto";

import {
  LUCKY_BOX_BOXES_TOTAL,
  LUCKY_BOX_PRIZES_MAX,
  LUCKY_BOX_PRIZES_MIN,
} from "../../constants/sellerLuckyBoxConstants.js";

/**
 * Случайная раскладка: позиции призовых коробок (count уникальных из 6).
 * Позиция layout[i] соответствует i-му включённому призу конфига.
 *
 * @param {number} count — сколько призовых коробок (1..4)
 */
export function generateLuckyBoxLayout(count) {
  const size = Math.min(
    LUCKY_BOX_PRIZES_MAX,
    Math.max(LUCKY_BOX_PRIZES_MIN, Math.floor(Number(count) || 0)),
  );
  const positions = new Set();
  while (positions.size < size) {
    positions.add(randomInt(LUCKY_BOX_BOXES_TOTAL));
  }
  return [...positions].sort((a, b) => a - b);
}
