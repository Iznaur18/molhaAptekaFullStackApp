import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { resolveOrderPrepaymentAmountRub } from "../src/index.js";

describe("сумма оплаты заказа по СБП", () => {
  it("товары плюс доставка по тарифу продавца", () => {
    assert.equal(
      resolveOrderPrepaymentAmountRub({
        totalAmount: 1000,
        shipments: [{ sellerDeliveryFeeRub: 150 }, { sellerDeliveryFeeRub: 0 }],
      }),
      1150,
    );
  });

  it("курьерская сумма не входит — её отдают курьеру из рук в руки", () => {
    assert.equal(
      resolveOrderPrepaymentAmountRub({
        totalAmount: 2,
        shipments: [{ deliveryFeeRub: 100 }],
      }),
      2,
    );
  });

  it("без заказа — ноль", () => {
    assert.equal(resolveOrderPrepaymentAmountRub(null), 0);
    assert.equal(resolveOrderPrepaymentAmountRub({}), 0);
  });
});
