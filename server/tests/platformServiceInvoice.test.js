import assert from "node:assert/strict";
import { after, afterEach, before, beforeEach, describe, it } from "node:test";
import mongoose from "mongoose";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";
process.env.FRONTEND_URL = "https://gitorg.ru";
process.env.YOOKASSA_SHOP_ID = "test-shop";
process.env.YOOKASSA_SECRET_KEY = "test-secret";

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { PaymentModel, ProductPromotionModel, UserModel } = await import(
  "../models/index.js"
);
const {
  applyPlatformServicePayment,
  createPlatformServicePayment,
} = await import("../services/payments/platformServiceInvoice.js");
const { registerPlatformServices } = await import(
  "../services/payments/registerPlatformServices.js"
);

registerPlatformServices();

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
    confirmation: { confirmation_url: `https://yoomoney.test/${id}` },
    amount: { value: "300.00", currency: "RUB" },
  },
});

const makeSeller = () =>
  UserModel.create({
    email: `promo-${Math.random().toString(36).slice(2)}@example.com`,
    passwordHash: "x".repeat(20),
    userName: `promo${Math.random().toString(36).slice(2, 9)}`,
    userPhoneNumber: "+79000000000",
  });

/** @param {unknown} sellerId @param {Record<string, unknown>} [overrides] */
const makePromotion = (sellerId, overrides = {}) =>
  ProductPromotionModel.create({
    productId: new mongoose.Types.ObjectId(),
    sellerId,
    status: "awaiting_payment",
    tier: 1,
    tariffCode: "day",
    tariffTitle: "1 день",
    durationHours: 24,
    amountRub: 300,
    paymentMethod: "sbp",
    ...overrides,
  });

before(async () => {
  await connectMongoTestReplSet();
});

after(async () => {
  globalThis.fetch = realFetch;
  await disconnectMongoTestReplSet();
});

beforeEach(async () => {
  fetchCalls = [];
  await clearMongoCollections();
});

afterEach(() => {
  globalThis.fetch = realFetch;
});

describe("счёт на услугу площадки", () => {
  it("создаёт платёж по СБП на сумму из самой услуги", async () => {
    const seller = await makeSeller();
    const promotion = await makePromotion(seller._id);
    stubFetch(() => pendingPayment("2c8f-svc-1"));

    const result = await createPlatformServicePayment({
      userId: String(seller._id),
      serviceKind: "product_promotion",
      targetId: String(promotion._id),
      returnUrl: "/profile/product-promotions",
    });

    assert.equal(result.amountRub, 300);
    const body = JSON.parse(fetchCalls[0].init.body);
    assert.equal(body.amount.value, "300.00");
    assert.equal(body.payment_method_data.type, "sbp");
    // Продвижение — услуга площадки, а не товар.
    assert.equal(body.receipt.items[0].payment_subject, "service");

    const payment = await PaymentModel.findById(result.paymentId).lean();
    assert.equal(payment.purpose, "platform_service");
    assert.equal(payment.serviceKind, "product_promotion");
    assert.equal(String(payment.serviceTargetId), String(promotion._id));
  });

  it("чужую услугу оплатить нельзя", async () => {
    const owner = await makeSeller();
    const stranger = await makeSeller();
    const promotion = await makePromotion(owner._id);
    stubFetch(() => pendingPayment("2c8f-svc-2"));

    await assert.rejects(
      createPlatformServicePayment({
        userId: String(stranger._id),
        serviceKind: "product_promotion",
        targetId: String(promotion._id),
        returnUrl: "/profile/product-promotions",
      }),
      /нельзя оплатить/i,
    );
  });

  it("уже активное продвижение повторно не оплачивается", async () => {
    const seller = await makeSeller();
    const promotion = await makePromotion(seller._id, { status: "active" });
    stubFetch(() => pendingPayment("2c8f-svc-3"));

    await assert.rejects(
      createPlatformServicePayment({
        userId: String(seller._id),
        serviceKind: "product_promotion",
        targetId: String(promotion._id),
        returnUrl: "/profile/product-promotions",
      }),
      /нельзя оплатить/i,
    );
  });

  it("сумму берёт сервер, а не запрос", async () => {
    const seller = await makeSeller();
    const promotion = await makePromotion(seller._id, { amountRub: 1500 });
    stubFetch(() => pendingPayment("2c8f-svc-4"));

    const result = await createPlatformServicePayment({
      userId: String(seller._id),
      serviceKind: "product_promotion",
      targetId: String(promotion._id),
      returnUrl: "/profile/product-promotions",
      // Тело запроса суммы не содержит вовсе — проверяем, что и не может.
    });

    assert.equal(result.amountRub, 1500);
  });
});

describe("применение оплаты услуги", () => {
  /** @param {unknown} sellerId */
  const paidPaymentFor = async (sellerId, promotionId, amountRub = 300) =>
    PaymentModel.create({
      userId: sellerId,
      purpose: "platform_service",
      serviceKind: "product_promotion",
      serviceTargetId: promotionId,
      amountRub,
      status: "created",
      idempotenceKey: `key-${Math.random().toString(36).slice(2)}`,
      providerPaymentId: "2c8f-apply",
    });

  it("успешная оплата включает продвижение", async () => {
    const seller = await makeSeller();
    const promotion = await makePromotion(seller._id);
    const payment = await paidPaymentFor(seller._id, promotion._id);

    const result = await applyPlatformServicePayment({
      paymentId: String(payment._id),
      providerStatus: "succeeded",
      providerAmountRub: 300,
    });

    assert.equal(result.applied, true);
    const updated = await ProductPromotionModel.findById(promotion._id).lean();
    assert.equal(updated.status, "active");
    assert.ok(updated.rubChargedAt);
    // Связь «за что заплатили» должна лежать в базе, а не только в логах:
    // поля paymentId в схеме не было, и mongoose молча его выбрасывал.
    assert.equal(String(updated.paymentId), String(payment._id));
    assert.ok(updated.paidAt);
  });

  it("повторное уведомление второй раз не включает", async () => {
    const seller = await makeSeller();
    const promotion = await makePromotion(seller._id);
    const payment = await paidPaymentFor(seller._id, promotion._id);

    await applyPlatformServicePayment({
      paymentId: String(payment._id),
      providerStatus: "succeeded",
      providerAmountRub: 300,
    });
    const second = await applyPlatformServicePayment({
      paymentId: String(payment._id),
      providerStatus: "succeeded",
      providerAmountRub: 300,
    });

    assert.equal(second.applied, false);
    assert.equal(second.reason, "already_applied");
  });

  it("расхождение суммы услугу не включает", async () => {
    const seller = await makeSeller();
    const promotion = await makePromotion(seller._id);
    const payment = await paidPaymentFor(seller._id, promotion._id);

    const result = await applyPlatformServicePayment({
      paymentId: String(payment._id),
      providerStatus: "succeeded",
      providerAmountRub: 1,
    });

    assert.equal(result.applied, false);
    assert.equal(result.reason, "amount_mismatch");
    assert.equal(
      (await ProductPromotionModel.findById(promotion._id).lean()).status,
      "awaiting_payment",
    );
  });

  it("отменённый платёж услугу не включает", async () => {
    const seller = await makeSeller();
    const promotion = await makePromotion(seller._id);
    const payment = await paidPaymentFor(seller._id, promotion._id);

    const result = await applyPlatformServicePayment({
      paymentId: String(payment._id),
      providerStatus: "canceled",
      providerAmountRub: 300,
    });

    assert.equal(result.applied, false);
    assert.equal(
      (await ProductPromotionModel.findById(promotion._id).lean()).status,
      "awaiting_payment",
    );
    assert.equal((await PaymentModel.findById(payment._id).lean()).status, "canceled");
  });
});
