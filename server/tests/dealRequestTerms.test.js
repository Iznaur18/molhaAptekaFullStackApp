import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { ProductModel, UserModel } = await import("../models/index.js");
const { acceptDealRequest, createDealRequest, setDealRequestOutcome } =
  await import("../services/deal-request/dealRequest.js");
const { resolveProductDealTermsWrite } =
  await import("../services/product/productDealTermsFields.js");
const { userHasConfirmedProductPurchase } =
  await import("../services/product/productReviewHelpers.js");

const inHours = (hours) => new Date(Date.now() + hours * 60 * 60 * 1000);

/** @param {string} prefix */
const createUser = (prefix) =>
  UserModel.create({
    email: `${prefix}-${Math.random().toString(36).slice(2)}@example.com`,
    passwordHash: "x".repeat(20),
    userName: `${prefix}${Math.random().toString(36).slice(2, 9)}`,
  });

/** @param {unknown} sellerId @param {Record<string, unknown>} extra */
const createListing = (sellerId, extra) =>
  ProductModel.create({
    productName: "Объявление",
    productPrice: 1500,
    productSeller: sellerId,
    productCategory: "autos",
    productModerationStatus: "approved",
    productIsAvailable: true,
    productStockQuantity: 1,
    ...extra,
  });

/** @param {Record<string, unknown>} productExtra */
const setup = async (productExtra) => {
  const seller = await createUser("seller");
  const buyer = await createUser("buyer");
  const product = await createListing(seller._id, productExtra);
  return {
    sellerId: String(seller._id),
    buyerId: String(buyer._id),
    productId: String(product._id),
  };
};

/** @param {{ buyerId: string; productId: string }} ctx */
const request = async ({ buyerId, productId }) =>
  (await createDealRequest({ userId: buyerId, productId, preferredAt: inHours(24) }))
    .request;

before(async () => {
  await connectMongoTestReplSet();
});

after(async () => {
  await disconnectMongoTestReplSet();
});

beforeEach(async () => {
  await clearMongoCollections();
});

describe("отзыв по заявке", () => {
  it("состоявшийся осмотр даёт право на отзыв, просто заявка — нет", async () => {
    const ctx = await setup({ productDealType: "viewing" });
    const created = await request(ctx);
    assert.equal(
      await userHasConfirmedProductPurchase(ctx.buyerId, ctx.productId),
      false,
    );

    await acceptDealRequest({ userId: ctx.sellerId, requestId: created.id });
    assert.equal(
      await userHasConfirmedProductPurchase(ctx.buyerId, ctx.productId),
      false,
      "договорились о встрече — ещё не сделка",
    );

    await setDealRequestOutcome({
      userId: ctx.sellerId,
      requestId: created.id,
      outcome: "completed",
    });
    assert.equal(
      await userHasConfirmedProductPurchase(ctx.buyerId, ctx.productId),
      true,
    );
  });

  it("«не договорились» и «не пришёл» права на отзыв не дают", async () => {
    for (const outcome of ["no_deal", "no_show"]) {
      const ctx = await setup({ productDealType: "viewing" });
      const created = await request(ctx);
      await acceptDealRequest({ userId: ctx.sellerId, requestId: created.id });
      await setDealRequestOutcome({
        userId: ctx.sellerId,
        requestId: created.id,
        outcome,
      });
      assert.equal(
        await userHasConfirmedProductPurchase(ctx.buyerId, ctx.productId),
        false,
        outcome,
      );
    }
  });

  it("услуга: отзыв только после подтверждения клиента, не после «выполнено»", async () => {
    const ctx = await setup({ productDealType: "service" });
    const created = await request(ctx);
    await acceptDealRequest({
      userId: ctx.sellerId,
      requestId: created.id,
      quotedPriceRub: 2000,
    });
    await setDealRequestOutcome({
      userId: ctx.sellerId,
      requestId: created.id,
      outcome: "completed",
    });

    assert.equal(
      await userHasConfirmedProductPurchase(ctx.buyerId, ctx.productId),
      false,
      "исполнитель не может сам открыть себе отзыв",
    );
  });
});

describe("цена в заявке на услугу", () => {
  it("точная цена попадает в заявку", async () => {
    const ctx = await setup({ productDealType: "service" });
    assert.equal((await request(ctx)).product.priceRub, 1500);
  });

  it("«от» и «договорная» в заявку не попадают — цену назовёт исполнитель", async () => {
    for (const productServicePriceMode of ["from", "negotiable"]) {
      const ctx = await setup({ productDealType: "service", productServicePriceMode });
      assert.equal(
        (await request(ctx)).product.priceRub,
        null,
        productServicePriceMode,
      );
    }
  });

  it("у осмотра цена объявления в заявке есть всегда", async () => {
    const ctx = await setup({
      productDealType: "viewing",
      productServicePriceMode: "negotiable",
    });
    assert.equal((await request(ctx)).product.priceRub, 1500);
  });
});

describe("условия сделки при сохранении объявления", () => {
  it("пишутся только присланные поля", () => {
    assert.deepEqual(resolveProductDealTermsWrite({}), {});
    assert.deepEqual(resolveProductDealTermsWrite(null), {});
    assert.deepEqual(
      resolveProductDealTermsWrite({ productViewingSchedule: "  по выходным " }),
      { productViewingSchedule: "по выходным" },
    );
  });

  it("незнакомые значения приводятся к безопасным", () => {
    assert.deepEqual(
      resolveProductDealTermsWrite({
        productServicePriceMode: "free",
        productServicePriceUnit: "km",
        productServiceLocations: ["online", "moon", "at_client"],
      }),
      {
        productServicePriceMode: "fixed",
        productServicePriceUnit: "service",
        productServiceLocations: ["at_client", "online"],
      },
    );
  });

  it("пустой список мест стирает прежний выбор", () => {
    assert.deepEqual(resolveProductDealTermsWrite({ productServiceLocations: [] }), {
      productServiceLocations: [],
    });
  });
});
