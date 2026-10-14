import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { myDealRequestsDataSchema } = await import("@molha/api-contract");
const { DealRequestModel, ProductModel, UserBlockModel, UserModel } =
  await import("../models/index.js");
const {
  acceptDealRequest,
  cancelDealRequest,
  confirmDealRequest,
  createDealRequest,
  declineDealRequest,
  getDealRequestSellerContact,
  listMyDealRequests,
  setDealRequestOutcome,
} = await import("../services/deal-request/dealRequest.js");
const { processDealRequestCronTasks } =
  await import("../services/deal-request/dealRequestCron.js");

const HOUR_MS = 60 * 60 * 1000;
const inHours = (hours) => new Date(Date.now() + hours * HOUR_MS);

let phoneSeq = 0;
/** @param {string} prefix */
const createUser = (prefix) =>
  UserModel.create({
    email: `${prefix}-${Math.random().toString(36).slice(2)}@example.com`,
    passwordHash: "x".repeat(20),
    userName: `${prefix}${Math.random().toString(36).slice(2, 9)}`,
    userPhoneNumber: `+7900000${String(1000 + (phoneSeq += 1))}`,
  });

/** @param {unknown} sellerId @param {string} productDealType */
const createListing = (sellerId, productDealType) =>
  ProductModel.create({
    productName: productDealType === "service" ? "Стрижка" : "Lada Vesta",
    productPrice: 1500,
    productSeller: sellerId,
    productCategory: "autos",
    productModerationStatus: "approved",
    productIsAvailable: true,
    productStockQuantity: 1,
    productDealType,
  });

/** @param {string} productDealType */
const setup = async (productDealType) => {
  const seller = await createUser("seller");
  const buyer = await createUser("buyer");
  const product = await createListing(seller._id, productDealType);
  return {
    sellerId: String(seller._id),
    buyerId: String(buyer._id),
    productId: String(product._id),
    seller,
    buyer,
  };
};

/** @param {{ buyerId: string; productId: string }} ctx */
const request = async ({ buyerId, productId }, extra = {}) =>
  (
    await createDealRequest({
      userId: buyerId,
      productId,
      preferredAt: inHours(24),
      comment: "Удобно вечером",
      ...extra,
    })
  ).request;

before(async () => {
  await connectMongoTestReplSet();
});

after(async () => {
  await disconnectMongoTestReplSet();
});

beforeEach(async () => {
  await clearMongoCollections();
});

describe("заявка на осмотр", () => {
  it("создаётся, видна обеим сторонам и ждёт ответа продавца", async () => {
    const ctx = await setup("viewing");
    const created = await request(ctx);

    assert.equal(created.status, "pending");
    assert.equal(created.kind, "viewing");
    assert.equal(created.product.name, "Lada Vesta");
    assert.deepEqual(created.actions, ["cancel"]);
    assert.ok(created.expiresAt, "у заявки есть срок ответа");

    const sellerList = await listMyDealRequests({
      userId: ctx.sellerId,
      role: "seller",
      page: 1,
      limit: 10,
    });
    assert.equal(sellerList.total, 1);
    assert.equal(sellerList.pendingActionCount, 1);
    assert.deepEqual(sellerList.requests[0].actions, ["accept", "decline"]);
    assert.equal(
      sellerList.requests[0].counterparty.phone,
      null,
      "телефон покупателя закрыт, пока продавец не принял заявку",
    );
  });

  it("телефон продавца покупателю осмотра виден сразу", async () => {
    const ctx = await setup("viewing");
    const contact = await getDealRequestSellerContact({
      userId: ctx.buyerId,
      productId: ctx.productId,
    });
    assert.equal(contact.phone, ctx.seller.userPhoneNumber);

    const created = await request(ctx);
    assert.equal(created.counterparty.phone, ctx.seller.userPhoneNumber);
  });

  it("после принятия телефоны открыты обеим сторонам", async () => {
    const ctx = await setup("viewing");
    const created = await request(ctx);
    const agreedAt = inHours(30);

    const { request: accepted } = await acceptDealRequest({
      userId: ctx.sellerId,
      requestId: created.id,
      agreedAt,
    });

    assert.equal(accepted.status, "accepted");
    assert.equal(accepted.agreedAt, agreedAt.toISOString());
    assert.equal(accepted.counterparty.phone, ctx.buyer.userPhoneNumber);
    assert.equal(accepted.quotedPriceRub, null, "у осмотра цены от продавца нет");
    assert.deepEqual(accepted.actions, ["completed", "no_deal", "no_show"]);
  });

  it("без своего времени продавец соглашается на время покупателя", async () => {
    const ctx = await setup("viewing");
    const created = await request(ctx);
    const { request: accepted } = await acceptDealRequest({
      userId: ctx.sellerId,
      requestId: created.id,
    });
    assert.equal(accepted.agreedAt, created.preferredAt);
  });

  it("состоявшаяся сделка снимает объявление и закрывает чужие заявки", async () => {
    const ctx = await setup("viewing");
    const other = await createUser("other");
    const winner = await request(ctx);
    const loser = await request({
      buyerId: String(other._id),
      productId: ctx.productId,
    });
    await acceptDealRequest({ userId: ctx.sellerId, requestId: winner.id });

    const { request: done } = await setDealRequestOutcome({
      userId: ctx.sellerId,
      requestId: winner.id,
      outcome: "completed",
    });

    assert.equal(done.status, "completed");
    assert.deepEqual(done.actions, []);
    const product = await ProductModel.findById(ctx.productId).lean();
    assert.equal(product.productIsAvailable, false);
    const closed = await DealRequestModel.findById(loser.id).lean();
    assert.equal(closed.status, "declined");
    assert.equal(closed.isOpen, false);
    assert.match(closed.declineReason, /сделка состоялась/);
  });

  it("«не договорились» объявление не трогает", async () => {
    const ctx = await setup("viewing");
    const created = await request(ctx);
    await acceptDealRequest({ userId: ctx.sellerId, requestId: created.id });
    const { request: closed } = await setDealRequestOutcome({
      userId: ctx.sellerId,
      requestId: created.id,
      outcome: "no_deal",
    });

    assert.equal(closed.status, "no_deal");
    const product = await ProductModel.findById(ctx.productId).lean();
    assert.equal(product.productIsAvailable, true);
  });
});

describe("заявка на услугу", () => {
  it("телефон исполнителя закрыт, пока он не принял заявку", async () => {
    const ctx = await setup("service");
    await assert.rejects(
      getDealRequestSellerContact({ userId: ctx.buyerId, productId: ctx.productId }),
      { statusCode: 403 },
    );

    const created = await request(ctx, { address: "Грозный, ул. Мира, 1" });
    assert.equal(created.counterparty.phone, null);
    assert.equal(created.address, "Грозный, ул. Мира, 1");

    await acceptDealRequest({
      userId: ctx.sellerId,
      requestId: created.id,
      quotedPriceRub: 2000,
    });
    const contact = await getDealRequestSellerContact({
      userId: ctx.buyerId,
      productId: ctx.productId,
    });
    assert.equal(contact.phone, ctx.seller.userPhoneNumber);
  });

  it("принять без цены нельзя", async () => {
    const ctx = await setup("service");
    const created = await request(ctx);
    await assert.rejects(
      acceptDealRequest({ userId: ctx.sellerId, requestId: created.id }),
      { statusCode: 400, message: "Назовите итоговую цену услуги" },
    );
    const row = await DealRequestModel.findById(created.id).lean();
    assert.equal(row.status, "pending", "заявка осталась ждать ответа");
  });

  it("«выполнено» ждёт подтверждения клиента, объявление остаётся на витрине", async () => {
    const ctx = await setup("service");
    const created = await request(ctx);
    await acceptDealRequest({
      userId: ctx.sellerId,
      requestId: created.id,
      quotedPriceRub: 2000,
    });

    const { request: done } = await setDealRequestOutcome({
      userId: ctx.sellerId,
      requestId: created.id,
      outcome: "completed",
    });
    assert.equal(done.status, "done");
    assert.equal(done.quotedPriceRub, 2000);

    const buyerList = await listMyDealRequests({
      userId: ctx.buyerId,
      role: "buyer",
      page: 1,
      limit: 10,
    });
    assert.deepEqual(buyerList.requests[0].actions, ["confirm"]);
    assert.equal(buyerList.pendingActionCount, 1);

    const { request: confirmed } = await confirmDealRequest({
      userId: ctx.buyerId,
      requestId: created.id,
    });
    assert.equal(confirmed.status, "completed");
    const product = await ProductModel.findById(ctx.productId).lean();
    assert.equal(product.productIsAvailable, true, "услугу оказывают много раз");
  });
});

describe("список заявок", () => {
  it("параметры из адресной строки приходят строками — ответ всё равно числами", async () => {
    const ctx = await setup("viewing");
    await request(ctx);

    // Так их отдаёт Express: приведённые схемой значения до сервиса не доходят.
    const list = await listMyDealRequests({
      userId: ctx.sellerId,
      role: "seller",
      page: "1",
      limit: "20",
    });
    assert.equal(myDealRequestsDataSchema.safeParse(list).success, true);
    assert.strictEqual(list.page, 1);
    assert.strictEqual(list.limit, 20);

    const defaults = await listMyDealRequests({ userId: ctx.buyerId });
    assert.equal(myDealRequestsDataSchema.safeParse(defaults).success, true);
    assert.equal(defaults.requests[0].role, "buyer");
  });

  it("каждая заявка в ответе проходит схему контракта", async () => {
    const ctx = await setup("service");
    const created = await request(ctx, { address: "Грозный, ул. Мира, 1" });
    await acceptDealRequest({
      userId: ctx.sellerId,
      requestId: created.id,
      quotedPriceRub: 2000,
    });

    for (const role of ["buyer", "seller"]) {
      const list = await listMyDealRequests({
        userId: role === "buyer" ? ctx.buyerId : ctx.sellerId,
        role,
        page: 1,
        limit: 10,
      });
      const parsed = myDealRequestsDataSchema.safeParse(list);
      assert.equal(parsed.success, true, JSON.stringify(parsed.error?.issues));
    }
  });
});

describe("кто и что может сделать с заявкой", () => {
  it("на своё объявление и на обычный товар заявку не оставить", async () => {
    const ctx = await setup("viewing");
    await assert.rejects(request({ buyerId: ctx.sellerId, productId: ctx.productId }), {
      statusCode: 400,
    });

    const goods = await createListing(ctx.sellerId, "goods");
    await assert.rejects(
      request({ buyerId: ctx.buyerId, productId: String(goods._id) }),
      {
        statusCode: 400,
      },
    );
  });

  it("вторая живая заявка на то же объявление отклоняется, после отмены — можно", async () => {
    const ctx = await setup("viewing");
    const first = await request(ctx);
    await assert.rejects(request(ctx), { statusCode: 409 });

    await cancelDealRequest({ userId: ctx.buyerId, requestId: first.id });
    const second = await request(ctx);
    assert.equal(second.status, "pending");
  });

  it("заблокированный продавцом покупатель заявку не оставит", async () => {
    const ctx = await setup("viewing");
    await UserBlockModel.create({ blockerId: ctx.sellerId, blockedId: ctx.buyerId });
    await assert.rejects(request(ctx), { statusCode: 403 });
    await assert.rejects(
      getDealRequestSellerContact({ userId: ctx.buyerId, productId: ctx.productId }),
      { statusCode: 403 },
    );
  });

  it("чужую заявку не видно и не тронуть", async () => {
    const ctx = await setup("viewing");
    const stranger = await createUser("stranger");
    const created = await request(ctx);

    await assert.rejects(
      acceptDealRequest({ userId: String(stranger._id), requestId: created.id }),
      { statusCode: 404 },
    );
    await assert.rejects(
      cancelDealRequest({ userId: String(stranger._id), requestId: created.id }),
      { statusCode: 404 },
    );
  });

  it("повторное решение по уже закрытой заявке отклоняется", async () => {
    const ctx = await setup("viewing");
    const created = await request(ctx);
    await declineDealRequest({
      userId: ctx.sellerId,
      requestId: created.id,
      reason: "Уже продано",
    });

    await assert.rejects(
      acceptDealRequest({ userId: ctx.sellerId, requestId: created.id }),
      { statusCode: 409 },
    );
    await assert.rejects(
      cancelDealRequest({ userId: ctx.buyerId, requestId: created.id }),
      { statusCode: 409 },
    );
    const row = await DealRequestModel.findById(created.id).lean();
    assert.equal(row.status, "declined");
    assert.equal(row.declineReason, "Уже продано");
  });

  it("покупатель не может поставить итог встречи вместо продавца", async () => {
    const ctx = await setup("viewing");
    const created = await request(ctx);
    await acceptDealRequest({ userId: ctx.sellerId, requestId: created.id });
    await assert.rejects(
      setDealRequestOutcome({
        userId: ctx.buyerId,
        requestId: created.id,
        outcome: "completed",
      }),
      { statusCode: 404 },
    );
  });
});

describe("сроки заявок", () => {
  it("заявка без ответа сгорает, свежая остаётся", async () => {
    const ctx = await setup("viewing");
    const other = await createUser("other");
    const stale = await request(ctx);
    const fresh = await request({
      buyerId: String(other._id),
      productId: ctx.productId,
    });
    await DealRequestModel.updateOne(
      { _id: stale.id },
      { $set: { expiresAt: new Date(Date.now() - 1000) } },
    );

    const result = await processDealRequestCronTasks();

    assert.deepEqual(result, { expired: 1, autoConfirmed: 0 });
    const staleRow = await DealRequestModel.findById(stale.id).lean();
    assert.equal(staleRow.status, "expired");
    assert.equal(staleRow.isOpen, false);
    assert.equal((await DealRequestModel.findById(fresh.id).lean()).status, "pending");
    // Сгоревшая заявка больше не мешает оставить новую.
    assert.equal((await request(ctx)).status, "pending");
  });

  it("услуга закрывается сама, если клиент не подтвердил вовремя", async () => {
    const ctx = await setup("service");
    const created = await request(ctx);
    await acceptDealRequest({
      userId: ctx.sellerId,
      requestId: created.id,
      quotedPriceRub: 900,
    });
    await setDealRequestOutcome({
      userId: ctx.sellerId,
      requestId: created.id,
      outcome: "completed",
    });

    assert.deepEqual(await processDealRequestCronTasks(), {
      expired: 0,
      autoConfirmed: 0,
    });

    await DealRequestModel.updateOne(
      { _id: created.id },
      { $set: { autoConfirmAt: new Date(Date.now() - 1000) } },
    );
    assert.deepEqual(await processDealRequestCronTasks(), {
      expired: 0,
      autoConfirmed: 1,
    });
    assert.equal(
      (await DealRequestModel.findById(created.id).lean()).status,
      "completed",
    );
  });

  it("принятая заявка не сгорает по сроку ответа", async () => {
    const ctx = await setup("viewing");
    const created = await request(ctx);
    await acceptDealRequest({ userId: ctx.sellerId, requestId: created.id });

    const row = await DealRequestModel.findById(created.id).lean();
    assert.equal(row.expiresAt, null);
    assert.deepEqual(await processDealRequestCronTasks({ now: inHours(100) }), {
      expired: 0,
      autoConfirmed: 0,
    });
  });
});
