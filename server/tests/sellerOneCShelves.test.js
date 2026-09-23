import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { createOrderLoyaltyFixture } =
  await import("./helpers/orderLoyaltyTestHelpers.js");
const { OneCCategoryMappingModel, ProductModel } = await import("../models/index.js");
const { listSellerOneCShelves, resolveOneCGroupBranchIds } =
  await import("../services/seller-shelf/sellerOneCShelves.js");
const { PRODUCT_MODERATION_APPROVED } =
  await import("../constants/productModerationConstants.js");

/**
 * Дерево как в боевой выгрузке: корень с товарами и подгруппами, пустой
 * корень и подгруппа без товаров.
 *
 * @param {import('mongoose').Types.ObjectId} sellerId
 */
const seedGroups = (sellerId) =>
  OneCCategoryMappingModel.insertMany([
    { sellerId, externalId: "g-kanc", name: "Канцтовары", depth: 0 },
    {
      sellerId,
      externalId: "g-pens",
      name: "Ручки",
      parentExternalId: "g-kanc",
      depth: 1,
    },
    {
      sellerId,
      externalId: "g-empty-child",
      name: "Тетради",
      parentExternalId: "g-kanc",
      depth: 1,
    },
    { sellerId, externalId: "g-bakery", name: "Бакалея", depth: 0 },
  ]);

/**
 * @param {import('mongoose').Types.ObjectId} sellerId
 * @param {string} groupId
 * @param {Record<string, unknown>} [patch]
 */
const seedProduct = (sellerId, groupId, patch = {}) =>
  ProductModel.create({
    productName: `Товар ${groupId}`,
    productPrice: 100,
    productSeller: sellerId,
    productCategory: "grocery",
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
    productStockQuantity: 5,
    product1cGroupId: groupId,
    ...patch,
  });

describe("полки витрины из групп 1С", () => {
  before(connectMongoTestReplSet);
  after(disconnectMongoTestReplSet);
  beforeEach(clearMongoCollections);

  it("корень считает всю ветку, пустые не показываются", async () => {
    const { seller } = await createOrderLoyaltyFixture();
    await seedGroups(seller._id);
    await seedProduct(seller._id, "g-kanc");
    await seedProduct(seller._id, "g-pens");
    await seedProduct(seller._id, "g-pens");

    const shelves = await listSellerOneCShelves(String(seller._id));

    assert.equal(shelves.length, 1, "пустая «Бакалея» на витрину не идёт");
    assert.equal(shelves[0].name, "Канцтовары");
    assert.equal(shelves[0].productCount, 3, "свой товар плюс два из подгруппы");
    assert.deepEqual(
      shelves[0].children.map((child) => [child.name, child.productCount]),
      [["Ручки", 2]],
      "пустая подгруппа «Тетради» тоже скрыта",
    );
  });

  it("снятый с витрины товар полку не держит", async () => {
    const { seller } = await createOrderLoyaltyFixture();
    await seedGroups(seller._id);
    await seedProduct(seller._id, "g-kanc", { productIsAvailable: false });

    assert.deepEqual(await listSellerOneCShelves(String(seller._id)), []);
  });

  it("ветка группы — она сама и все вложенные", async () => {
    const { seller } = await createOrderLoyaltyFixture();
    await seedGroups(seller._id);

    const branch = await resolveOneCGroupBranchIds(String(seller._id), "g-kanc");

    assert.deepEqual([...branch].sort(), ["g-empty-child", "g-kanc", "g-pens"]);
  });

  it("у продавца без 1С полок нет", async () => {
    const { seller } = await createOrderLoyaltyFixture();

    assert.deepEqual(await listSellerOneCShelves(String(seller._id)), []);
  });
  it("третий уровень тоже приходит", async () => {
    const { seller } = await createOrderLoyaltyFixture();
    await seedGroups(seller._id);
    await OneCCategoryMappingModel.create({
      sellerId: seller._id,
      externalId: "g-gel",
      name: "Гелевые",
      parentExternalId: "g-pens",
      depth: 2,
    });
    await seedProduct(seller._id, "g-gel");

    const [kanc] = await listSellerOneCShelves(String(seller._id));

    assert.equal(kanc.productCount, 1, "товар глубокой подгруппы считается в корне");
    const pens = kanc.children.find((child) => child.name === "Ручки");
    assert.deepEqual(
      pens.children.map((child) => child.name),
      ["Гелевые"],
      "вложенность не обрывается на двух уровнях",
    );
  });
});
