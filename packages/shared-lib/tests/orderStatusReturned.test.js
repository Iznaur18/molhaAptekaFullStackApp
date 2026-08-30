import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildOrderStatusFromItems } from "../dist/index.js";

/**
 * Копия rollup'а живёт и на сервере, и здесь. Когда добавился статус
 * «Возвращён», серверную копию обновили, а эту — нет: заказ проваливался
 * в `pending`, и покупатель видел «В обработке» вместо «Возвращён».
 */
describe("rollup статуса заказа: возврат", () => {
  it("все позиции возвращены → заказ возвращён", () => {
    assert.equal(
      buildOrderStatusFromItems([{ status: "returned" }, { status: "returned" }]),
      "returned",
    );
  });

  it("одна возвращённая позиция → заказ возвращён", () => {
    assert.equal(buildOrderStatusFromItems([{ status: "returned" }]), "returned");
  });

  it("часть отменена, часть возвращена → заказ отменён", () => {
    assert.equal(
      buildOrderStatusFromItems([{ status: "cancelled" }, { status: "returned" }]),
      "cancelled",
    );
  });

  it("возврат рядом с активной позицией не закрывает заказ", () => {
    assert.equal(
      buildOrderStatusFromItems([{ status: "returned" }, { status: "pending" }]),
      "pending",
    );
  });

  it("прежние переходы не сломаны", () => {
    assert.equal(buildOrderStatusFromItems([{ status: "confirmed" }]), "confirmed");
    assert.equal(buildOrderStatusFromItems([{ status: "cancelled" }]), "cancelled");
    assert.equal(buildOrderStatusFromItems([{ status: "shipped" }]), "shipped");
    assert.equal(buildOrderStatusFromItems([]), "pending");
  });
});
