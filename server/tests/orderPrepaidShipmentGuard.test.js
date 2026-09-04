import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  assertOrderAcceptedBySeller,
  assertOrderPrepaid,
  isOrderAcceptedBySeller,
  isOrderAwaitingPrepayment,
} from "../services/order/assertOrderPrepaid.js";

/**
 * Порядок такой: продавец подтверждает, что товар есть → покупатель платит →
 * продавец собирает. Оплата вперёд подтверждения означала бы возврат денег на
 * каждый «нет в наличии», а сборка вперёд оплаты — товар в обмен на обещание.
 */
describe("гейт оплаты и отгрузки", () => {
  it("предоплаченный и неоплаченный заказ дальше подтверждения не двигается", () => {
    const order = { paymentMethod: "cardPrepaid", prepaidPaidAt: null };
    assert.equal(isOrderAwaitingPrepayment(order), true);
    assert.throws(() => assertOrderPrepaid(order), /не оплачен/i);
  });

  it("после оплаты заказ двигается", () => {
    const order = { paymentMethod: "cardPrepaid", prepaidPaidAt: new Date() };
    assert.equal(isOrderAwaitingPrepayment(order), false);
    assert.doesNotThrow(() => assertOrderPrepaid(order));
  });

  it("наличные и перевод при получении гейтом не задеты", () => {
    for (const paymentMethod of ["cashOnDelivery", "cardOnDelivery"]) {
      const order = { paymentMethod, prepaidPaidAt: null };
      assert.equal(isOrderAwaitingPrepayment(order), false);
      assert.doesNotThrow(() => assertOrderPrepaid(order));
    }
  });

  it("неподтверждённый заказ оплатить нельзя", () => {
    const order = { items: [{ status: "pending" }] };
    assert.equal(isOrderAcceptedBySeller(order), false);
    assert.throws(() => assertOrderAcceptedBySeller(order), /не подтвердил/i);
  });

  it("подтверждённый заказ оплатить можно", () => {
    for (const status of ["accepted", "assembling", "ready_to_ship"]) {
      const order = { items: [{ status }] };
      assert.equal(isOrderAcceptedBySeller(order), true, `статус ${status}`);
      assert.doesNotThrow(() => assertOrderAcceptedBySeller(order));
    }
  });

  it("подтверждена должна быть каждая живая позиция", () => {
    const order = { items: [{ status: "accepted" }, { status: "pending" }] };
    assert.equal(isOrderAcceptedBySeller(order), false);
  });

  it("отменённые позиции подтверждению не мешают", () => {
    const order = { items: [{ status: "accepted" }, { status: "cancelled" }] };
    assert.equal(
      isOrderAcceptedBySeller(order),
      true,
      "продавец про отменённую позицию уже решил",
    );
  });

  it("заказ целиком из отменённых оплатить нельзя", () => {
    const order = { items: [{ status: "cancelled" }, { status: "returned" }] };
    assert.equal(isOrderAcceptedBySeller(order), false);
  });

  it("пустой заказ не роняет проверки", () => {
    assert.equal(isOrderAwaitingPrepayment(null), false);
    assert.equal(isOrderAcceptedBySeller(null), false);
    assert.doesNotThrow(() => assertOrderPrepaid(null));
  });
});
