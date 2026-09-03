import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const {
  connectMongoTestReplSet,
  disconnectMongoTestReplSet,
  clearMongoCollections,
} = await import("./helpers/mongoTestDb.js");

const { OrderModel, ProductModel, UserModel } = await import(
  "../models/index.js"
);
const { up } = await import(
  "../scripts/migrations/20260903-onec-products-without-images-and-stock.js"
);

/** @type {any} */
let seller;

before(async () => {
  await connectMongoTestReplSet();
});

after(async () => {
  await disconnectMongoTestReplSet();
});

beforeEach(async () => {
  await clearMongoCollections();
  seller = await UserModel.create({
    userName: `onec_migration_seller_${Date.now()}`,
    email: `onec_migration_${Date.now()}@test.local`,
    passwordHash: "hash",
  });
});

/**
 * @param {Partial<Record<string, unknown>>} overrides
 */
const createProduct = (overrides) =>
  ProductModel.create({
    productName: "Товар",
    productPrice: 100,
    productSeller: seller._id,
    productCategory: "pharmacy",
    productFromOneC: true,
    productImageUrls: [],
    productStockQuantity: 0,
    ...overrides,
  });

describe("миграция: товары 1С без картинок и без остатка", () => {
  it("считает кандидатов, но в dry-run ничего не удаляет", async () => {
    await createProduct({ product1cGuid: "a" });
    await createProduct({ product1cGuid: "b", productStockQuantity: 4 });

    const result = await up({ isApply: false });

    assert.equal(result.candidates, 1);
    assert.equal(result.deleted, 0);
    assert.equal(result.dryRun, true);
    assert.equal(await ProductModel.countDocuments({}), 2);
  });

  it("удаляет только те, у кого нет ни картинок, ни остатка", async () => {
    const doomed = await createProduct({ product1cGuid: "doomed" });
    const withImage = await createProduct({
      product1cGuid: "with-image",
      productImageUrls: ["/uploads/a.webp"],
    });
    const withStock = await createProduct({
      product1cGuid: "with-stock",
      productStockQuantity: 7,
    });
    // Товар продавца, заведённый руками: правило 1С его не касается.
    const manual = await createProduct({
      product1cGuid: null,
      productFromOneC: false,
    });

    const result = await up({ isApply: true });

    assert.equal(result.deleted, 1);
    assert.equal(result.blockedByOrders, 0);
    assert.equal(await ProductModel.countDocuments({ _id: doomed._id }), 0);

    const survived = await ProductModel.find({}).select("_id").lean();
    assert.deepEqual(
      survived.map((row) => String(row._id)).sort(),
      [withImage._id, withStock._id, manual._id].map(String).sort(),
    );
  });

  it("товар с незакрытым заказом не удаляет, а снимает с витрины", async () => {
    const buyer = await UserModel.create({
      userName: `buyer_${Date.now()}`,
      email: `buyer_${Date.now()}@test.local`,
      passwordHash: "hash",
    });
    const sold = await createProduct({
      product1cGuid: "sold",
      productIsAvailable: true,
    });

    await OrderModel.create({
      userBuyerId: buyer._id,
      items: [
        {
          productId: sold._id,
          quantity: 1,
          unitPriceAtOrder: 100,
          productNameAtOrder: "Товар",
          status: "pending",
        },
      ],
      totalAmount: 100,
      deliveryAddress: "Тестовый адрес",
      deliveryAddressFlat: "1",
      fulfillmentMethod: "pickup",
      paymentMethod: "cashOnDelivery",
      status: "pending",
    });

    const result = await up({ isApply: true });

    assert.equal(result.deleted, 0);
    assert.equal(result.blockedByOrders, 1);

    const after = await ProductModel.findById(sold._id).lean();
    assert.ok(after, "карточка осталась — на неё ссылается заказ");
    assert.equal(after.productIsAvailable, false);
    assert.equal(after.productOutOfStock, true);
  });
});
