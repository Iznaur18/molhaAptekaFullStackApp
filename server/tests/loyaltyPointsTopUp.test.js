import assert from "node:assert/strict";
import { after, afterEach, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";
process.env.FRONTEND_URL = "https://gitorg.ru";
process.env.YOOKASSA_SHOP_ID = "test-shop";
process.env.YOOKASSA_SECRET_KEY = "test-secret";

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { PaymentModel, UserModel } = await import("../models/index.js");
const { applyLoyaltyPointsTopUp, createLoyaltyPointsTopUp } = await import(
  "../services/payments/loyaltyPointsTopUp.js"
);

const realFetch = globalThis.fetch;
/** @type {{ url: string; init: RequestInit }[]} */
let fetchCalls = [];

/**
 * Подменяем сам `fetch`, а не экспорт модуля: неймспейс ES-модуля заморожен,
 * а так под тест попадает и клиент ЮKassa — заголовки, тело, идемпотентность.
 *
 * @param {(url: string, init: RequestInit) => { status?: number; body: unknown }} handler
 */
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

const paymentPendingResponse = (id) => ({
  status: 200,
  body: {
    id,
    status: "pending",
    amount: { value: "100.00", currency: "RUB" },
    confirmation: { confirmation_url: "https://yoomoney.ru/checkout/pay" },
  },
});

/** @param {{ phone?: string }} [options] */
async function makeUser({ phone = "+79990000000" } = {}) {
  return UserModel.create({
    userName: `buyer-${Math.random().toString(36).slice(2, 10)}`,
    email: `${Math.random().toString(36).slice(2, 10)}@example.com`,
    passwordHash: "x".repeat(60),
    userPhoneNumber: phone,
    userLoyaltyPoints: 0,
  });
}

describe("пополнение баллов через ЮKassa", () => {
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

  it("создаёт платёж и отдаёт ссылку на оплату, баллы пока не начисляя", async () => {
    const user = await makeUser();
    stubFetch(() => paymentPendingResponse("2c8f-0001"));

    const result = await createLoyaltyPointsTopUp({
      userId: String(user._id),
      amountRub: 500,
      returnUrl: "/loyalty-points",
    });

    assert.equal(result.amountRub, 500);
    assert.equal(result.confirmationUrl, "https://yoomoney.ru/checkout/pay");

    const fresh = await UserModel.findById(user._id).select("userLoyaltyPoints").lean();
    assert.equal(fresh.userLoyaltyPoints, 0, "до оплаты баллов нет");

    const [call] = fetchCalls;
    assert.equal(call.url, "https://api.yookassa.ru/v3/payments");
    assert.ok(call.init.headers.Authorization.startsWith("Basic "));
    assert.ok(call.init.headers["Idempotence-Key"], "ключ идемпотентности обязателен");

    const body = JSON.parse(call.init.body);
    assert.equal(body.amount.value, "500.00");
    assert.equal(body.capture, true);
    assert.equal(
      body.confirmation.return_url,
      "https://gitorg.ru/loyalty-points",
      "origin берётся из FRONTEND_URL, а не из тела запроса",
    );
    assert.equal(body.receipt.items[0].amount.value, "500.00");
    assert.equal(body.receipt.customer.phone, "79990000000");
  });

  it("повтор с тем же ключом отдаёт ту же ссылку, а не второй платёж", async () => {
    const user = await makeUser();
    stubFetch(() => paymentPendingResponse("2c8f-0002"));

    const first = await createLoyaltyPointsTopUp({
      userId: String(user._id),
      amountRub: 100,
      returnUrl: "/loyalty-points",
      idempotencyKey: "same-key",
    });
    const second = await createLoyaltyPointsTopUp({
      userId: String(user._id),
      amountRub: 100,
      returnUrl: "/loyalty-points",
      idempotencyKey: "same-key",
    });

    assert.equal(second.paymentId, first.paymentId);
    assert.equal(second.duplicate, true);
    assert.equal(await PaymentModel.countDocuments({ userId: user._id }), 1);
    assert.equal(fetchCalls.length, 1, "в банк сходили один раз");
  });

  it("чужой адрес возврата не принимается", async () => {
    const user = await makeUser();
    stubFetch(() => paymentPendingResponse("2c8f-0003"));

    await assert.rejects(
      () =>
        createLoyaltyPointsTopUp({
          userId: String(user._id),
          amountRub: 100,
          returnUrl: "https://evil.example/steal",
        }),
      /путём внутри сайта/i,
    );
    assert.equal(fetchCalls.length, 0, "до банка такой запрос не доходит");
  });

  it("без email и телефона чек собрать нельзя", async () => {
    const user = await UserModel.create({
      userName: `nocontact-${Math.random().toString(36).slice(2, 10)}`,
      passwordHash: "x".repeat(60),
    });
    stubFetch(() => paymentPendingResponse("2c8f-0004"));

    await assert.rejects(
      () =>
        createLoyaltyPointsTopUp({
          userId: String(user._id),
          amountRub: 100,
          returnUrl: "/loyalty-points",
        }),
      /для чека нужен email или телефон/i,
    );
  });

  it("успешный платёж начисляет баллы один раз, сколько бы уведомлений ни пришло", async () => {
    const user = await makeUser();
    stubFetch(() => paymentPendingResponse("2c8f-0005"));

    const created = await createLoyaltyPointsTopUp({
      userId: String(user._id),
      amountRub: 300,
      returnUrl: "/loyalty-points",
    });

    const first = await applyLoyaltyPointsTopUp({
      paymentId: created.paymentId,
      providerStatus: "succeeded",
      providerAmountRub: 300,
    });
    const second = await applyLoyaltyPointsTopUp({
      paymentId: created.paymentId,
      providerStatus: "succeeded",
      providerAmountRub: 300,
    });

    assert.equal(first.applied, true);
    assert.equal(first.credited, 300);
    assert.equal(second.applied, false);
    assert.equal(second.reason, "already_applied");

    const fresh = await UserModel.findById(user._id).select("userLoyaltyPoints").lean();
    assert.equal(fresh.userLoyaltyPoints, 300, "начисление ровно одно");
  });

  it("сумма из банка расходится с нашей — баллы не начисляем", async () => {
    const user = await makeUser();
    stubFetch(() => paymentPendingResponse("2c8f-0006"));

    const created = await createLoyaltyPointsTopUp({
      userId: String(user._id),
      amountRub: 100,
      returnUrl: "/loyalty-points",
    });

    const result = await applyLoyaltyPointsTopUp({
      paymentId: created.paymentId,
      providerStatus: "succeeded",
      providerAmountRub: 100000,
    });

    assert.equal(result.applied, false);
    assert.equal(result.reason, "amount_mismatch");
    const fresh = await UserModel.findById(user._id).select("userLoyaltyPoints").lean();
    assert.equal(fresh.userLoyaltyPoints, 0);
  });

  it("отменённый платёж закрывается без начисления", async () => {
    const user = await makeUser();
    stubFetch(() => paymentPendingResponse("2c8f-0007"));

    const created = await createLoyaltyPointsTopUp({
      userId: String(user._id),
      amountRub: 100,
      returnUrl: "/loyalty-points",
    });

    const result = await applyLoyaltyPointsTopUp({
      paymentId: created.paymentId,
      providerStatus: "canceled",
      providerAmountRub: 100,
    });

    assert.equal(result.applied, false);
    const payment = await PaymentModel.findById(created.paymentId).lean();
    assert.equal(payment.status, "canceled");
    const fresh = await UserModel.findById(user._id).select("userLoyaltyPoints").lean();
    assert.equal(fresh.userLoyaltyPoints, 0);
  });

  it("отказ банка не оставляет висящий платёж", async () => {
    const user = await makeUser();
    stubFetch(() => ({ status: 400, body: { description: "Invalid receipt" } }));

    await assert.rejects(() =>
      createLoyaltyPointsTopUp({
        userId: String(user._id),
        amountRub: 100,
        returnUrl: "/loyalty-points",
      }),
    );

    assert.equal(await PaymentModel.countDocuments({ userId: user._id }), 0);
  });

  it("описание ошибки банка наружу не утекает", async () => {
    const user = await makeUser();
    stubFetch(() => ({
      status: 400,
      body: { description: "Секретная деталь про магазин" },
    }));

    await assert.rejects(
      () =>
        createLoyaltyPointsTopUp({
          userId: String(user._id),
          amountRub: 100,
          returnUrl: "/loyalty-points",
        }),
      (error) => {
        assert.doesNotMatch(error.message, /Секретная деталь/);
        return true;
      },
    );
  });
});
