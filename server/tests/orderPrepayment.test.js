import assert from "node:assert/strict";
import { after, afterEach, before, beforeEach, describe, it } from "node:test";
import mongoose from "mongoose";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";
process.env.FRONTEND_URL = "https://gitorg.ru";
process.env.YOOKASSA_SHOP_ID = "test-shop";
process.env.YOOKASSA_SECRET_KEY = "test-secret";

const PLATFORM_SELLER_ID = new mongoose.Types.ObjectId().toString();
const FOREIGN_SELLER_ID = new mongoose.Types.ObjectId().toString();
process.env.PLATFORM_SELLER_USER_IDS = PLATFORM_SELLER_ID;

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { OrderModel, PaymentModel, UserModel } = await import("../models/index.js");
const {
  applyOrderPrepayment,
  areAllSellersPlatformOwned,
  createOrderPrepayment,
  isOrderPrepaymentAvailable,
} = await import("../services/payments/orderPrepayment.js");

const realFetch = globalThis.fetch;
/** @type {{ url: string; init: RequestInit }[]} */
let fetchCalls = [];

/** @param {(url: string, init: RequestInit) => { status?: number; body: unknown }} handler */
function stubFetch(handler) {
  globalThis.fetch = async (url, init) => {
    fetchCalls.push({ url: String(url), init });
    const { status = 200, body } = handler(String(url), init);
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
      text: async () => JSON.stringify(body),
    };
  };
}

const pendingPayment = (id) => ({
  status: 200,
  body: {
    id,
    status: "pending",
    amount: { value: "0.00", currency: "RUB" },
    confirmation: { confirmation_url: "https://yoomoney.ru/checkout/pay" },
  },
});

async function makeBuyer() {
  return UserModel.create({
    userName: `buyer-${Math.random().toString(36).slice(2, 10)}`,
    email: `${Math.random().toString(36).slice(2, 10)}@example.com`,
    passwordHash: "x".repeat(60),
    userPhoneNumber: "+79990000000",
  });
}

/** @param {{ userId: string; sellerId: string; total?: number }} input */
async function makeOrder({ userId, sellerId, total = 1500 }) {
  return OrderModel.create({
    userBuyerId: userId,
    items: [
      {
        productId: new mongoose.Types.ObjectId(),
        quantity: 2,
        unitPriceAtOrder: 750,
        productNameAtOrder: "Тестовый товар",
        sellerIdAtOrder: sellerId,
        // Оплата открыта только после подтверждения продавцом.
        status: "accepted",
      },
    ],
    totalAmount: total,
    paymentMethod: "cardPrepaid",
    deliveryAddress: "г Москва, ул Тестовая, д 1",
  });
}

describe("предоплата заказа картой", () => {
  before(connectMongoTestReplSet);
  after(async () => {
    globalThis.fetch = realFetch;
    await disconnectMongoTestReplSet();
  });
  beforeEach(async () => {
    await clearMongoCollections();
    fetchCalls = [];
  });
  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  it("предоплата доступна только при настроенных ключах и списке продавцов", () => {
    assert.equal(isOrderPrepaymentAvailable(), true);
  });

  it("свой продавец проходит, чужой — нет", () => {
    assert.equal(
      areAllSellersPlatformOwned([{ sellerId: PLATFORM_SELLER_ID }]),
      true,
    );
    assert.equal(
      areAllSellersPlatformOwned([
        { sellerId: PLATFORM_SELLER_ID },
        { sellerId: FOREIGN_SELLER_ID },
      ]),
      false,
      "смешанный заказ платить картой нельзя",
    );
    assert.equal(areAllSellersPlatformOwned([]), false, "пустой заказ не проходит");
  });

  it("создаёт платёж на сумму заказа с позициями в чеке", async () => {
    const buyer = await makeBuyer();
    const order = await makeOrder({
      userId: buyer._id,
      sellerId: PLATFORM_SELLER_ID,
    });
    stubFetch(() => pendingPayment("2c8f-order-1"));

    const result = await createOrderPrepayment({
      userId: String(buyer._id),
      orderId: String(order._id),
      returnUrl: "/my-orders",
    });

    assert.equal(result.amountRub, 1500);
    const body = JSON.parse(fetchCalls[0].init.body);
    assert.equal(body.amount.value, "1500.00");
    assert.equal(body.confirmation.return_url, "https://gitorg.ru/my-orders");
    assert.equal(body.receipt.items[0].description, "Тестовый товар");
    assert.equal(body.receipt.items[0].quantity, "2.00");
    assert.equal(body.receipt.items[0].payment_subject, "commodity");
  });

  it("за чужой товар платёж не создаётся", async () => {
    const buyer = await makeBuyer();
    const order = await makeOrder({ userId: buyer._id, sellerId: FOREIGN_SELLER_ID });
    stubFetch(() => pendingPayment("2c8f-order-2"));

    await assert.rejects(
      () =>
        createOrderPrepayment({
          userId: String(buyer._id),
          orderId: String(order._id),
          returnUrl: "/my-orders",
        }),
      /только для товаров Gitorg/i,
    );
    assert.equal(fetchCalls.length, 0, "до банка запрос не доходит");
  });

  it("чужой заказ оплатить нельзя", async () => {
    const buyer = await makeBuyer();
    const stranger = await makeBuyer();
    const order = await makeOrder({ userId: buyer._id, sellerId: PLATFORM_SELLER_ID });
    stubFetch(() => pendingPayment("2c8f-order-3"));

    await assert.rejects(
      () =>
        createOrderPrepayment({
          userId: String(stranger._id),
          orderId: String(order._id),
          returnUrl: "/my-orders",
        }),
      /заказ не найден/i,
    );
  });

  it("успешный платёж отмечает заказ оплаченным ровно один раз", async () => {
    const buyer = await makeBuyer();
    const order = await makeOrder({ userId: buyer._id, sellerId: PLATFORM_SELLER_ID });
    stubFetch(() => pendingPayment("2c8f-order-4"));

    const created = await createOrderPrepayment({
      userId: String(buyer._id),
      orderId: String(order._id),
      returnUrl: "/my-orders",
    });

    const first = await applyOrderPrepayment({
      paymentId: created.paymentId,
      providerStatus: "succeeded",
      providerAmountRub: 1500,
    });
    const second = await applyOrderPrepayment({
      paymentId: created.paymentId,
      providerStatus: "succeeded",
      providerAmountRub: 1500,
    });

    assert.equal(first.applied, true);
    assert.equal(second.applied, false);
    assert.equal(second.reason, "already_applied");

    const fresh = await OrderModel.findById(order._id).lean();
    assert.ok(fresh.prepaidPaidAt, "заказ помечен оплаченным");
    assert.equal(String(fresh.prepaidPaymentId), created.paymentId);
  });

  it("оплаченный заказ второй раз не оплачивается", async () => {
    const buyer = await makeBuyer();
    const order = await makeOrder({ userId: buyer._id, sellerId: PLATFORM_SELLER_ID });
    stubFetch(() => pendingPayment("2c8f-order-5"));

    const created = await createOrderPrepayment({
      userId: String(buyer._id),
      orderId: String(order._id),
      returnUrl: "/my-orders",
    });
    await applyOrderPrepayment({
      paymentId: created.paymentId,
      providerStatus: "succeeded",
      providerAmountRub: 1500,
    });

    await assert.rejects(
      () =>
        createOrderPrepayment({
          userId: String(buyer._id),
          orderId: String(order._id),
          returnUrl: "/my-orders",
        }),
      /уже оплачен/i,
    );
  });

  it("сумма из банка расходится — заказ не отмечаем", async () => {
    const buyer = await makeBuyer();
    const order = await makeOrder({ userId: buyer._id, sellerId: PLATFORM_SELLER_ID });
    stubFetch(() => pendingPayment("2c8f-order-6"));

    const created = await createOrderPrepayment({
      userId: String(buyer._id),
      orderId: String(order._id),
      returnUrl: "/my-orders",
    });

    const result = await applyOrderPrepayment({
      paymentId: created.paymentId,
      providerStatus: "succeeded",
      providerAmountRub: 1,
    });

    assert.equal(result.applied, false);
    assert.equal(result.reason, "amount_mismatch");
    const fresh = await OrderModel.findById(order._id).lean();
    assert.equal(fresh.prepaidPaidAt, null);
  });

  it("отказ банка не оставляет висящий платёж", async () => {
    const buyer = await makeBuyer();
    const order = await makeOrder({ userId: buyer._id, sellerId: PLATFORM_SELLER_ID });
    stubFetch(() => ({ status: 400, body: { description: "bad receipt" } }));

    await assert.rejects(() =>
      createOrderPrepayment({
        userId: String(buyer._id),
        orderId: String(order._id),
        returnUrl: "/my-orders",
      }),
    );
    assert.equal(await PaymentModel.countDocuments({ userId: buyer._id }), 0);
  });
});

describe("чек по заказу", () => {
  before(connectMongoTestReplSet);
  after(async () => {
    globalThis.fetch = realFetch;
    await disconnectMongoTestReplSet();
  });
  beforeEach(async () => {
    await clearMongoCollections();
    fetchCalls = [];
  });
  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  it("цена берётся из unitPriceAtOrder — поля priceAtOrder в заказе нет", async () => {
    const buyer = await makeBuyer();
    const order = await makeOrder({ userId: buyer._id, sellerId: PLATFORM_SELLER_ID });
    stubFetch(() => pendingPayment("2c8f-receipt-1"));

    await createOrderPrepayment({
      userId: String(buyer._id),
      orderId: String(order._id),
      returnUrl: "/my-orders",
    });

    const body = JSON.parse(fetchCalls[0].init.body);
    assert.equal(body.receipt.items[0].amount.value, "750.00", "нулевой цены быть не должно");
    assert.equal(body.receipt.items[0].quantity, "2.00");
  });

  it("бесплатные единицы по акции в чек не попадают", async () => {
    const buyer = await makeBuyer();
    const order = await OrderModel.create({
      userBuyerId: buyer._id,
      items: [
        {
          productId: new mongoose.Types.ObjectId(),
          quantity: 3,
          unitPriceAtOrder: 100,
          buyNFreeUnitsAtOrder: 1,
          productNameAtOrder: "Акционный товар",
          sellerIdAtOrder: PLATFORM_SELLER_ID,
          status: "accepted",
        },
      ],
      // Платит покупатель за две единицы из трёх.
      totalAmount: 200,
      paymentMethod: "cardPrepaid",
      deliveryAddress: "г Москва, ул Тестовая, д 1",
    });
    stubFetch(() => pendingPayment("2c8f-receipt-2"));

    await createOrderPrepayment({
      userId: String(buyer._id),
      orderId: String(order._id),
      returnUrl: "/my-orders",
    });

    const body = JSON.parse(fetchCalls[0].init.body);
    assert.equal(body.receipt.items[0].quantity, "2.00", "бесплатная единица не оплачивается");
    assert.equal(body.amount.value, "200.00");
  });

  it("расхождение чека с суммой заказа не пускает платёж в банк", async () => {
    const buyer = await makeBuyer();
    const order = await OrderModel.create({
      userBuyerId: buyer._id,
      items: [
        {
          productId: new mongoose.Types.ObjectId(),
          quantity: 1,
          unitPriceAtOrder: 100,
          productNameAtOrder: "Товар",
          sellerIdAtOrder: PLATFORM_SELLER_ID,
          status: "accepted",
        },
      ],
      // Сумма заказа не сходится с позициями — чек был бы неверным.
      totalAmount: 999,
      paymentMethod: "cardPrepaid",
      deliveryAddress: "г Москва, ул Тестовая, д 1",
    });
    stubFetch(() => pendingPayment("2c8f-receipt-3"));

    await assert.rejects(
      () =>
        createOrderPrepayment({
          userId: String(buyer._id),
          orderId: String(order._id),
          returnUrl: "/my-orders",
        }),
      /не удалось собрать чек/i,
    );
    assert.equal(fetchCalls.length, 0, "в банк такой платёж не уходит");
    assert.equal(await PaymentModel.countDocuments({ userId: buyer._id }), 0);
  });
});
