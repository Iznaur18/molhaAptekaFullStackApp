import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import mongoose from "mongoose";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { PaymentModel } = await import("../models/index.js");
const { resolveReusablePayment, PAYMENT_INTENT_CONFLICT_MESSAGE } = await import(
  "../services/payments/paymentIdempotency.js"
);

const USER = new mongoose.Types.ObjectId();
const ORDER = new mongoose.Types.ObjectId();
const OTHER_ORDER = new mongoose.Types.ObjectId();
const PROMOTION = new mongoose.Types.ObjectId();

/** @param {Record<string, unknown>} [overrides] */
const createPayment = (overrides = {}) =>
  PaymentModel.create({
    userId: USER,
    purpose: "order",
    amountRub: 1500,
    status: "created",
    orderId: ORDER,
    idempotenceKey: `key-${Math.random().toString(36).slice(2)}`,
    // Без него платёж считается незаконченной гонкой, а не годной ссылкой.
    providerPaymentId: `prov-${Math.random().toString(36).slice(2)}`,
    confirmationUrl: "https://yoomoney.example/confirm",
    ...overrides,
  });

/** @param {Record<string, unknown>} [overrides] */
const orderIntent = (overrides = {}) => ({
  userId: String(USER),
  purpose: "order",
  amountRub: 1500,
  orderId: ORDER,
  ...overrides,
});

before(async () => {
  await connectMongoTestReplSet();
  // Индексы создаются по схеме: partial-unique и есть то, что проверяем.
  await PaymentModel.syncIndexes();
});

after(async () => {
  await disconnectMongoTestReplSet();
});

beforeEach(async () => {
  await clearMongoCollections();
  await PaymentModel.syncIndexes();
});

describe("ключ идемпотентности привязан к цели", () => {
  it("тот же ключ на тот же заказ отдаёт тот же платёж", async () => {
    const payment = await createPayment({ idempotenceKey: "same-key" });

    const found = await resolveReusablePayment(
      orderIntent({ idempotenceKey: "same-key" }),
    );

    assert.equal(String(found._id), String(payment._id));
  });

  it("тот же ключ на ДРУГОЙ заказ — конфликт, а не чужая ссылка", async () => {
    await createPayment({ idempotenceKey: "same-key" });

    await assert.rejects(
      () =>
        resolveReusablePayment(
          orderIntent({ idempotenceKey: "same-key", orderId: OTHER_ORDER }),
        ),
      (error) => {
        assert.equal(error.statusCode, 409);
        assert.equal(error.message, PAYMENT_INTENT_CONFLICT_MESSAGE);
        return true;
      },
      "раньше возвращалась ссылка на оплату чужого заказа с чужой суммой",
    );
  });

  it("тот же ключ на другую цель платежа — конфликт", async () => {
    await createPayment({ idempotenceKey: "same-key" });

    await assert.rejects(() =>
      resolveReusablePayment({
        userId: String(USER),
        idempotenceKey: "same-key",
        purpose: "loyalty_points",
        amountRub: 1500,
      }),
    );
  });

  it("тот же ключ с другой суммой — конфликт", async () => {
    await createPayment({ idempotenceKey: "same-key" });

    await assert.rejects(() =>
      resolveReusablePayment(orderIntent({ idempotenceKey: "same-key", amountRub: 10 })),
    );
  });

  it("чужой платёж по тому же ключу не находится", async () => {
    await createPayment({
      idempotenceKey: "same-key",
      userId: new mongoose.Types.ObjectId(),
      orderId: OTHER_ORDER,
    });

    const found = await resolveReusablePayment(
      orderIntent({ idempotenceKey: "same-key" }),
    );

    assert.equal(found, null);
  });
});

describe("второй счёт на тот же заказ", () => {
  it("без ключа переиспользует уже открытый счёт", async () => {
    const payment = await createPayment();

    // Клиент ключ не присылает вовсе: сервер генерит свой на каждый запрос,
    // и раньше каждое нажатие «Оплатить» заводило новый платёж у провайдера.
    const found = await resolveReusablePayment(
      orderIntent({ idempotenceKey: "fresh-uuid-every-time" }),
    );

    assert.equal(String(found._id), String(payment._id));
  });

  it("оплаченный счёт переиспользованию не подлежит", async () => {
    await createPayment({ status: "succeeded" });

    const found = await resolveReusablePayment(orderIntent({ idempotenceKey: "new" }));

    assert.equal(found, null);
  });

  it("отменённый счёт не мешает завести новый", async () => {
    await createPayment({ status: "canceled" });

    const found = await resolveReusablePayment(orderIntent({ idempotenceKey: "new" }));

    assert.equal(found, null);
  });

  it("открытый счёт без id у провайдера — это гонка, а не ссылка", async () => {
    await createPayment({ providerPaymentId: "", confirmationUrl: "" });

    const found = await resolveReusablePayment(orderIntent({ idempotenceKey: "new" }));

    assert.equal(found, null, "иначе клиент получил бы пустую ссылку на оплату");
  });

  it("сумма разошлась с открытым счётом — конфликт, а не второй счёт", async () => {
    await createPayment();

    await assert.rejects(() =>
      resolveReusablePayment(orderIntent({ idempotenceKey: "new", amountRub: 99 })),
    );
  });

  it("услуга площадки переиспользует свой открытый счёт", async () => {
    const payment = await createPayment({
      purpose: "platform_service",
      orderId: null,
      serviceKind: "product_promotion",
      serviceTargetId: PROMOTION,
      amountRub: 173,
    });

    const found = await resolveReusablePayment({
      userId: String(USER),
      idempotenceKey: "another-key",
      purpose: "platform_service",
      amountRub: 173,
      serviceKind: "product_promotion",
      serviceTargetId: String(PROMOTION),
    });

    assert.equal(String(found._id), String(payment._id));
  });

  it("пополнение баллов объекта не имеет — повтор только по ключу", async () => {
    await createPayment({ purpose: "loyalty_points", orderId: null, amountRub: 500 });

    const found = await resolveReusablePayment({
      userId: String(USER),
      idempotenceKey: "another-key",
      purpose: "loyalty_points",
      amountRub: 500,
    });

    assert.equal(found, null, "два пополнения подряд — это два разных намерения");
  });
});

describe("индекс как последняя линия обороны", () => {
  it("база не даёт создать второй открытый счёт по заказу", async () => {
    await createPayment();

    await assert.rejects(
      () => createPayment(),
      (error) => {
        assert.equal(error.code, 11000, "ожидали конфликт уникального индекса");
        return true;
      },
      "две одновременные попытки успевают разойтись между чтением и записью",
    );
  });

  it("после отмены первого второй счёт заводится", async () => {
    const first = await createPayment();
    await PaymentModel.updateOne({ _id: first._id }, { $set: { status: "canceled" } });

    const second = await createPayment();

    assert.ok(second._id);
  });

  it("база не даёт создать второй открытый счёт по услуге", async () => {
    const service = {
      purpose: "platform_service",
      orderId: null,
      serviceKind: "product_promotion",
      serviceTargetId: PROMOTION,
      amountRub: 173,
    };
    await createPayment(service);

    await assert.rejects(() => createPayment(service), (error) => error.code === 11000);
  });

  it("пополнения баллов индекс не ограничивает", async () => {
    const topUp = { purpose: "loyalty_points", orderId: null, amountRub: 500 };
    await createPayment(topUp);

    const second = await createPayment(topUp);

    assert.ok(second._id, "у пополнения нет объекта, ограничивать нечего");
  });
});
