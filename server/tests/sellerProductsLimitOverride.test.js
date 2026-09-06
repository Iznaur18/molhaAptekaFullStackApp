import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { ProductModel, UserModel } = await import("../models/index.js");
const {
  assertSellerCanCreateProduct,
  getSellerProductsLimit,
  isSellerProductsLimitReached,
} = await import("../services/product/sellerProductsLimit.js");
const {
  SELLER_PRODUCTS_LIMIT_PREMIUM,
  SELLER_PRODUCTS_LIMIT_REGULAR,
  SELLER_PRODUCTS_LIMIT_UNLIMITED,
} = await import("@molha/api-contract");

const premium = () => ({
  isPremiumUser: true,
  premiumExpiresAt: new Date(Date.now() + 86_400_000),
});

before(async () => {
  await connectMongoTestReplSet();
});

after(async () => {
  await disconnectMongoTestReplSet();
});

beforeEach(async () => {
  await clearMongoCollections();
});

describe("персональный лимит товаров", () => {
  it("без него всё как раньше", () => {
    assert.equal(getSellerProductsLimit({}), SELLER_PRODUCTS_LIMIT_REGULAR);
    assert.equal(getSellerProductsLimit(premium()), SELLER_PRODUCTS_LIMIT_PREMIUM);
  });

  it("перекрывает премиум в обе стороны", () => {
    // Админ назначает лимит точечно и бессрочно, премиум продавец покупает сам
    // и на месяц: покупка премиума не должна опускать выданное вручную.
    assert.equal(
      getSellerProductsLimit({ ...premium(), sellerProductsLimitOverride: 500 }),
      500,
    );
    assert.equal(
      getSellerProductsLimit({ ...premium(), sellerProductsLimitOverride: 10 }),
      10,
    );
  });

  it("безлимит не упирается ни на каком количестве", () => {
    const user = { sellerProductsLimitOverride: SELLER_PRODUCTS_LIMIT_UNLIMITED };

    assert.equal(getSellerProductsLimit(user), SELLER_PRODUCTS_LIMIT_UNLIMITED);
    assert.equal(isSellerProductsLimitReached(user, 1_000_000), false);
  });

  it("ноль закрывает создание, а не означает безлимит", () => {
    const user = { sellerProductsLimitOverride: 0 };

    assert.equal(isSellerProductsLimitReached(user, 0), true);
  });
});

describe("проверка перед созданием товара", () => {
  /** @param {Record<string, unknown>} [overrides] */
  const createSeller = (overrides = {}) =>
    UserModel.create({
      email: `limit-${Math.random().toString(36).slice(2)}@example.com`,
      passwordHash: "x".repeat(20),
      userName: `limit${Math.random().toString(36).slice(2, 9)}`,
      ...overrides,
    });

  /** @param {unknown} sellerId @param {number} count */
  const seedProducts = (sellerId, count) =>
    ProductModel.insertMany(
      Array.from({ length: count }, (_, index) => ({
        productName: `Товар ${index}`,
        productPrice: 100,
        productSeller: sellerId,
        productCategory: "autos",
      })),
    );

  it("безлимитному продавцу разрешено при полном каталоге", async () => {
    const seller = await createSeller({
      sellerProductsLimitOverride: SELLER_PRODUCTS_LIMIT_UNLIMITED,
    });
    await seedProducts(seller._id, SELLER_PRODUCTS_LIMIT_PREMIUM + 5);

    const result = await assertSellerCanCreateProduct(String(seller._id), seller);

    assert.deepEqual(result, { ok: true });
  });

  it("с личным лимитом отказ называет его, а не общие 50 и 100", async () => {
    const seller = await createSeller({ sellerProductsLimitOverride: 3 });
    await seedProducts(seller._id, 3);

    const result = await assertSellerCanCreateProduct(String(seller._id), seller);

    assert.equal(result.ok, false);
    assert.match(result.message, /лимит товаров: 3/iu);
    assert.doesNotMatch(result.message, /50|100/u);
  });

  it("личный лимит выше общего действительно поднимает потолок", async () => {
    const seller = await createSeller({ sellerProductsLimitOverride: 120 });
    await seedProducts(seller._id, SELLER_PRODUCTS_LIMIT_PREMIUM + 1);

    const result = await assertSellerCanCreateProduct(String(seller._id), seller);

    assert.deepEqual(result, { ok: true });
  });

  it("нулевой лимит объясняет, что создание закрыто", async () => {
    const seller = await createSeller({ sellerProductsLimitOverride: 0 });

    const result = await assertSellerCanCreateProduct(String(seller._id), seller);

    assert.equal(result.ok, false);
    assert.match(result.message, /закрыто/u);
  });
});

describe("сохранение лимита в профиле", () => {
  it("модель принимает безлимит, число и отсутствие лимита", async () => {
    for (const value of [SELLER_PRODUCTS_LIMIT_UNLIMITED, 0, 500, null]) {
      const user = new UserModel({
        email: `save-${Math.random().toString(36).slice(2)}@example.com`,
        passwordHash: "x".repeat(20),
        userName: `save${Math.random().toString(36).slice(2, 9)}`,
        sellerProductsLimitOverride: value,
      });

      await user.validate();
      assert.equal(user.sellerProductsLimitOverride, value);
    }
  });

  it("значение ниже безлимита схема не принимает", async () => {
    const user = new UserModel({
      email: `bad-${Math.random().toString(36).slice(2)}@example.com`,
      passwordHash: "x".repeat(20),
      userName: `bad${Math.random().toString(36).slice(2, 9)}`,
      sellerProductsLimitOverride: -5,
    });

    await assert.rejects(() => user.validate());
  });
});
