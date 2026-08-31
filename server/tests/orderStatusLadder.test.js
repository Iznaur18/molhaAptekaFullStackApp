import assert from "node:assert/strict";
import { describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";

const { buildOrderStatusFromItems } = await import(
  "../services/order/orderStatus.js"
);

/** @param {...string} statuses */
const rollup = (...statuses) =>
  buildOrderStatusFromItems(statuses.map((status) => ({ status })));

describe("свод статуса заказа: старое поведение", () => {
  it("всё подтверждено", () => {
    assert.equal(rollup("confirmed", "confirmed"), "confirmed");
  });

  it("доставлено рядом с подтверждённым — доставлен", () => {
    assert.equal(rollup("delivered", "confirmed"), "delivered");
  });

  it("отправлено рядом с доставленным — отправлен", () => {
    assert.equal(rollup("shipped", "delivered", "confirmed"), "shipped");
  });

  it("всё возвращено", () => {
    assert.equal(rollup("returned", "returned"), "returned");
  });

  it("всё отменено", () => {
    assert.equal(rollup("cancelled", "cancelled"), "cancelled");
  });

  it("отмена вперемешку с возвратом — отменён", () => {
    assert.equal(rollup("cancelled", "returned"), "cancelled");
  });

  it("возврат рядом с активной позицией не закрывает заказ", () => {
    assert.equal(rollup("returned", "pending"), "pending");
    assert.equal(rollup("returned", "shipped"), "pending");
  });

  it("пустой заказ — в обработке", () => {
    assert.equal(buildOrderStatusFromItems([]), "pending");
    assert.equal(buildOrderStatusFromItems(null), "pending");
  });
});

describe("свод статуса заказа: новые ступени", () => {
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

  it("вся лестница до конца", () => {
    assert.equal(rollup("accepted"), "accepted");
    assert.equal(rollup("assembling"), "assembling");
    assert.equal(rollup("ready_for_pickup"), "ready_for_pickup");
    assert.equal(rollup("ready_to_ship"), "ready_to_ship");
  });

  it("отмена рядом с новой ступенью не закрывает заказ", () => {
    assert.equal(rollup("cancelled", "assembling"), "pending");
  });

  it("неизвестный статус не роняет свод", () => {
    assert.equal(rollup("accepted", "чтототакое"), "pending");
  });
});
