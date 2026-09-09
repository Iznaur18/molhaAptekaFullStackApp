import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildOrderStatusFromItems } from "../dist/index.js";

/**
 * Зеркало `server/tests/orderStatusLadder.test.js`. Копия rollup'а живёт в
 * двух местах, и однажды сервер уже уехал вперёд без этой: покупатель видел
 * «В обработке» вместо «Возвращён».
 *
 * @param {...string} statuses
 */
const rollup = (...statuses) =>
  buildOrderStatusFromItems(statuses.map((status) => ({ status })));

describe("rollup статуса заказа: старое поведение", () => {
  it("всё подтверждено", () => {
    assert.equal(rollup("confirmed", "confirmed"), "confirmed");
  });

  it("доставлено рядом с подтверждённым — доставлен", () => {
    assert.equal(rollup("delivered", "confirmed"), "delivered");
  });

  it("отправлено рядом с доставленным — отправлен", () => {
    assert.equal(rollup("shipped", "delivered", "confirmed"), "shipped");
  });

  it("возврат рядом с активной позицией не закрывает заказ", () => {
    assert.equal(rollup("returned", "pending"), "pending");
  });

  it("вернувшаяся позиция не тянет ступень живых назад", () => {
    assert.equal(rollup("returned", "shipped"), "shipped");
  });
});

describe("rollup статуса заказа: новые ступени", () => {
  it("заказ идёт по самой отстающей позиции", () => {
    assert.equal(rollup("accepted", "assembling"), "accepted");
    assert.equal(rollup("assembling", "ready_to_ship"), "assembling");
    assert.equal(rollup("ready_for_pickup", "shipped"), "ready_for_pickup");
  });

  it("принят обгоняет в обработке", () => {
    assert.equal(rollup("pending", "accepted"), "pending");
  });

  it("готов к выдаче и готов к отгрузке — одна ступень", () => {
    const mixed = rollup("ready_for_pickup", "ready_to_ship");
    assert.ok(
      mixed === "ready_for_pickup" || mixed === "ready_to_ship",
      "смесь веток не превращается в выдуманный третий статус",
    );
  });

  it("отмена рядом с новой ступенью не закрывает заказ и не сбрасывает ступень", () => {
    // Кнопка продавца строится по этой ступени, а сервер считает переход по
    // живым позициям: разойдясь, они давали 409 на «Принять» после отмены.
    assert.equal(rollup("cancelled", "assembling"), "assembling");
    assert.equal(rollup("cancelled", "accepted"), "accepted");
  });

  it("неизвестный статус не роняет свод", () => {
    assert.equal(rollup("accepted", "чтототакое"), "pending");
  });
});
