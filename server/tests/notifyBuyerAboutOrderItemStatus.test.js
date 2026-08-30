import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { UserInAppNotificationModel } = await import("../models/index.js");
const { buildBuyerOrderStatusMessage, notifyBuyerAboutOrderItemStatus } =
  await import("../services/order/notifyBuyerAboutOrderItemStatus.js");

const BUYER = "6a8200da92fa5bb5a9db1e53";
const SELLER = "6a80be5996133a35bdf11487";

describe("текст уведомления покупателю", () => {
  it("подставляет название товара", () => {
    assert.equal(
      buildBuyerOrderStatusMessage({
        status: "shipped",
        productName: "Вишня в белом шоколаде",
      }),
      "Заказ передан в доставку: Вишня в белом шоколаде",
    );
  });

  it("обходится без названия", () => {
    assert.equal(
      buildBuyerOrderStatusMessage({ status: "delivered", productName: "" }),
      "Заказ доставлен — подтвердите получение",
    );
  });

  it("режет длинное название — в пуше его всё равно обрежет система", () => {
    const message = buildBuyerOrderStatusMessage({
      status: "shipped",
      productName: "Клубника в молочном шоколаде SCHOFRULADE 8х130гр. подарочная упаковка",
    });
    assert.ok(message.length < 90, message);
    assert.ok(message.endsWith("…"), message);
  });

  it("молчит на статусах, о которых покупателю знать нечего", () => {
    assert.equal(buildBuyerOrderStatusMessage({ status: "pending" }), "");
    assert.equal(buildBuyerOrderStatusMessage({ status: "confirmed" }), "");
  });
});

describe("отправка уведомления покупателю", () => {
  before(connectMongoTestReplSet);
  after(disconnectMongoTestReplSet);
  beforeEach(clearMongoCollections);

  it("создаёт уведомление, когда статус меняет продавец", async () => {
    await notifyBuyerAboutOrderItemStatus({
      buyerUserId: BUYER,
      actorUserId: SELLER,
      status: "shipped",
      productName: "Манго в молочном шоколаде",
    });

    const rows = await UserInAppNotificationModel.find({ userId: BUYER }).lean();
    assert.equal(rows.length, 1);
    assert.equal(rows[0].kind, "buyer_order_status");
    assert.match(rows[0].message, /передан в доставку/);
    // productId намеренно пуст: клик должен вести в заказы, а не на товар.
    assert.equal(rows[0].productId, null);
  });

  it("не уведомляет покупателя о его же отмене", async () => {
    await notifyBuyerAboutOrderItemStatus({
      buyerUserId: BUYER,
      actorUserId: BUYER,
      status: "cancelled",
      productName: "Малина в молочном шоколаде",
    });

    assert.equal(await UserInAppNotificationModel.countDocuments({}), 0);
  });

  it("уведомляет, когда позицию отменил продавец", async () => {
    await notifyBuyerAboutOrderItemStatus({
      buyerUserId: BUYER,
      actorUserId: SELLER,
      status: "cancelled",
      productName: "Ананас в темном шоколаде",
    });

    const rows = await UserInAppNotificationModel.find({ userId: BUYER }).lean();
    assert.equal(rows.length, 1);
    assert.match(rows[0].message, /отменил позицию/);
  });

  it("ничего не делает без покупателя", async () => {
    await notifyBuyerAboutOrderItemStatus({
      buyerUserId: null,
      status: "shipped",
      productName: "Банан",
    });

    assert.equal(await UserInAppNotificationModel.countDocuments({}), 0);
  });
});
