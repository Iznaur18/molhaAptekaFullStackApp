import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  assertOrderPrepaid,
  isOrderAwaitingPrepayment,
} from "../services/order/assertOrderPrepaid.js";

/**
 * Отгрузка неоплаченного заказа — это товар в обмен на обещание: покупателю
 * достаточно закрыть форму оплаты, а продавец уже собрал и отдал.
 */
describe("блокировка отгрузки до оплаты", () => {
  it("предоплаченный и неоплаченный заказ двигать нельзя", () => {
    const order = { paymentMethod: "cardPrepaid", prepaidPaidAt: null };
    assert.equal(isOrderAwaitingPrepayment(order), true);
    assert.throws(() => assertOrderPrepaid(order), /не оплачен/i);
  });

  it("после оплаты заказ двигается", () => {
    const order = { paymentMethod: "cardPrepaid", prepaidPaidAt: new Date() };
    assert.equal(isOrderAwaitingPrepayment(order), false);
    assert.doesNotThrow(() => assertOrderPrepaid(order));
  });

  it("наличные и перевод при получении блокировкой не задеты", () => {
    for (const paymentMethod of ["cashOnDelivery", "cardOnDelivery"]) {
      const order = { paymentMethod, prepaidPaidAt: null };
      assert.equal(
        isOrderAwaitingPrepayment(order),
        false,
        `${paymentMethod}: оплата и есть вручение, требовать её заранее нечего`,
      );
      assert.doesNotThrow(() => assertOrderPrepaid(order));
    }
  });

  it("пустой заказ не роняет проверку", () => {
    assert.equal(isOrderAwaitingPrepayment(null), false);
    assert.equal(isOrderAwaitingPrepayment(undefined), false);
    assert.doesNotThrow(() => assertOrderPrepaid(null));
  });
});
