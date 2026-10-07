import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

import mongoose from "mongoose";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { default: ProductCategoryModel } =
  await import("../models/ProductCategoryModel.js");
const { default: ProductModel } = await import("../models/ProductModel.js");
const { UserModel } = await import("../models/index.js");
const { up } =
  await import("../scripts/migrations/20261007-product-category-breadcrumb-dedupe.js");

describe("миграция: повтор подкатегории в хлебных крошках", () => {
  /** @type {any} */
  let leaf;
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
    const root = await ProductCategoryModel.create({
      slug: "coffee",
      labelRu: "Кафе и рестораны",
      parentId: null,
      depth: 0,
      pathSlugs: ["coffee"],
      pathLabelRu: ["Кафе и рестораны"],
      isLeaf: false,
    });
    leaf = await ProductCategoryModel.create({
      slug: "coffee-pizza",
      labelRu: "Пицца",
      parentId: root._id,
      depth: 1,
      pathSlugs: ["coffee", "coffee-pizza"],
      pathIds: [root._id],
      pathLabelRu: ["Кафе и рестораны", "Пицца"],
      isLeaf: true,
    });
    seller = await UserModel.create({
      userName: "crumb_seller",
      email: "crumb_seller@t.local",
      passwordHash: "h",
    });
  });

  /** @param {Record<string, unknown>} overrides */
  const createProduct = (overrides) =>
    ProductModel.create({
      productName: "Пицца",
      productPrice: 100,
      productSeller: seller._id,
      productCategory: "coffee",
      productCategoryId: leaf._id,
      ...overrides,
    });

  const run = (isApply) => up({ db: mongoose.connection.db, isApply });

  it("убирает повтор и не трогает дату правки товара", async () => {
    const broken = await createProduct({
      categoryBreadcrumbRu: "Кафе и рестораны › Пицца › Пицца",
    });
    const fine = await createProduct({
      categoryBreadcrumbRu: "Кафе и рестораны › Пицца",
    });

    const summary = await run(true);

    assert.equal(summary.productsFixed, 1);
    const saved = await ProductModel.findById(broken._id).lean();
    assert.equal(saved.categoryBreadcrumbRu, "Кафе и рестораны › Пицца");
    assert.equal(saved.updatedAt.getTime(), broken.updatedAt.getTime());
    const untouched = await ProductModel.findById(fine._id).lean();
    assert.equal(untouched.categoryBreadcrumbRu, "Кафе и рестораны › Пицца");
  });

  it("пробный прогон только считает; повторный запуск ничего не меняет", async () => {
    const broken = await createProduct({
      categoryBreadcrumbRu: "Кафе и рестораны › Пицца › Пицца",
    });

    const dry = await run(false);
    assert.equal(dry.productsToFix, 1);
    assert.equal(dry.productsFixed, 0);
    assert.equal(
      (await ProductModel.findById(broken._id).lean()).categoryBreadcrumbRu,
      "Кафе и рестораны › Пицца › Пицца",
    );

    await run(true);
    const again = await run(true);
    assert.equal(again.productsToFix, 0);
    assert.equal(again.productsFixed, 0);
  });

  it("товар без подкатегории и товар удалённой категории не трогаем", async () => {
    const noCategory = await createProduct({
      productCategoryId: null,
      categoryBreadcrumbRu: "",
    });
    const orphan = await createProduct({
      productCategoryId: new mongoose.Types.ObjectId(),
      categoryBreadcrumbRu: "Старое › Старое",
    });

    const summary = await run(true);

    assert.equal(summary.categoriesMissing, 1);
    assert.equal(
      (await ProductModel.findById(noCategory._id).lean()).categoryBreadcrumbRu,
      "",
    );
    assert.equal(
      (await ProductModel.findById(orphan._id).lean()).categoryBreadcrumbRu,
      "Старое › Старое",
    );
  });
});
