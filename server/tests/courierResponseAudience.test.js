import assert from "node:assert/strict";
import { describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";

const {
  sanitizeOrderForBuyerApi,
  sanitizeOrderForCourierApi,
  sanitizeOrderForSellerApi,
} = await import("../services/order/buyerPassportShare.js");

const SELLER = "aaaaaaaaaaaaaaaaaaaaaaaa";

/** Отправление, доведённое до «Доставлен»: тут у покупателя есть код. */
const makeOrder = () => ({
  userBuyerId: "bbbbbbbbbbbbbbbbbbbbbbbb",
  items: [{ sellerIdAtOrder: SELLER, status: "delivered" }],
  shipments: [
    {
      sellerId: SELLER,
      fulfillmentMethod: "delivery",
      courierDelivery: true,
      handoverCode: "1111",
      deliveryCode: "2222",
      sellerPayoutRequisites: "2200 1234 5678 9010",
    },
  ],
  buyerPassportShare: { passport: "секрет" },
});

describe("чистка ответа по звонящему", () => {
  it("курьер не получает код вручения", () => {
    const order = sanitizeOrderForCourierApi(makeOrder());

    assert.equal(
      order.shipments[0].deliveryCode,
      undefined,
      "иначе курьер закрывает доставку сам, без покупателя",
    );
    assert.equal(order.shipments[0].handoverCode, undefined);
  });

  it("курьер не получает реквизиты продавца", () => {
    const order = sanitizeOrderForCourierApi(makeOrder());

    assert.equal(order.shipments[0].sellerPayoutRequisites, undefined);
  });

  it("курьер не получает паспорт покупателя", () => {
    const order = sanitizeOrderForCourierApi(makeOrder());

    assert.equal(order.buyerPassportShare, undefined);
  });

  it("покупателю его код по-прежнему приходит", () => {
    const order = sanitizeOrderForBuyerApi(makeOrder());

    assert.equal(order.shipments[0].deliveryCode, "2222");
    assert.equal(order.shipments[0].handoverCode, undefined);
  });

  it("продавцу не приходит ни код вручения, ни чужие реквизиты", () => {
    const order = sanitizeOrderForSellerApi(makeOrder());

    assert.equal(order.shipments[0].deliveryCode, undefined);
    assert.equal(order.shipments[0].sellerPayoutRequisites, undefined);
  });
});
