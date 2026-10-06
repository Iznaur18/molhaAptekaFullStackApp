import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { default: ProductCategoryModel } =
  await import("../models/ProductCategoryModel.js");
const { default: ProductModel } = await import("../models/ProductModel.js");
const { UserModel } = await import("../models/index.js");
const { reassignProductsToCategoryLeaves } =
  await import("../services/product/reassignProductsToCategoryLeaves.js");

describe("раскладка товаров по подкатегориям", () => {
  /** @type {any} */
  let root;
  /** @type {any} */
  let branch;
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
    root = await ProductCategoryModel.create({
      slug: "autos",
      labelRu: "Автомобили",
      parentId: null,
      depth: 0,
      pathSlugs: ["autos"],
      pathLabelRu: ["Автомобили"],
      isLeaf: false,
      legacyProductCategory: "autos",
    });
    branch = await ProductCategoryModel.create({
      slug: "autos-accessories",
      labelRu: "Аксессуары",
      parentId: root._id,
      depth: 1,
      pathSlugs: ["autos", "autos-accessories"],
      pathIds: [root._id],
      pathLabelRu: ["Автомобили", "Аксессуары"],
      isLeaf: false,
    });
    leaf = await ProductCategoryModel.create({
      slug: "autos-accessories-holders",
      labelRu: "Держатели",
      parentId: branch._id,
      depth: 2,
      pathSlugs: ["autos", "autos-accessories", "autos-accessories-holders"],
      pathIds: [root._id, branch._id],
      pathLabelRu: ["Автомобили", "Аксессуары", "Держатели"],
      isLeaf: true,
    });
    seller = await UserModel.create({
      userName: "reassign_seller",
      email: "reassign_seller@t.local",
      passwordHash: "h",
    });
  });

  /** @param {Record<string, unknown>} [overrides] */
  const createProduct = (overrides = {}) =>
    ProductModel.create({
      productName: "Автодержатель",
      productPrice: 100,
      productSeller: seller._id,
      productCategory: "autos",
      productCategoryId: null,
      ...overrides,
    });

  it("товар без подкатегории попадает в лист с путём и корневым слагом", async () => {
    const product = await createProduct();

    const summary = await reassignProductsToCategoryLeaves({
      assignments: { [String(product._id)]: leaf.slug },
    });

    assert.equal(summary.reassigned, 1);
    const saved = await ProductModel.findById(product._id).lean();
    assert.equal(String(saved.productCategoryId), String(leaf._id));
    assert.equal(saved.productCategory, "autos");
    assert.deepEqual(saved.categoryPathIds.map(String), [
      String(root._id),
      String(branch._id),
      String(leaf._id),
    ]);
    assert.match(saved.categoryBreadcrumbRu, /Держатели/);
  });

  it("выбор продавца важнее: товар с подкатегорией не трогаем", async () => {
    const other = await ProductCategoryModel.create({
      slug: "autos-accessories-mats",
      labelRu: "Коврики",
      parentId: branch._id,
      depth: 2,
      pathSlugs: ["autos", "autos-accessories", "autos-accessories-mats"],
      pathIds: [root._id, branch._id],
      pathLabelRu: ["Автомобили", "Аксессуары", "Коврики"],
      isLeaf: true,
    });
    const product = await createProduct({ productCategoryId: other._id });

    const summary = await reassignProductsToCategoryLeaves({
      assignments: { [String(product._id)]: leaf.slug },
    });

    assert.equal(summary.reassigned, 0);
    assert.equal(summary.skippedAlreadyCategorized, 1);
    const saved = await ProductModel.findById(product._id).lean();
    assert.equal(String(saved.productCategoryId), String(other._id));
  });

  it("пробный прогон считает, но не пишет; повтор ничего не меняет", async () => {
    const product = await createProduct();
    const assignments = { [String(product._id)]: leaf.slug };

    const dry = await reassignProductsToCategoryLeaves({ assignments, dryRun: true });
    assert.equal(dry.reassigned, 1);
    assert.equal(
      (await ProductModel.findById(product._id).lean()).productCategoryId,
      null,
    );

    await reassignProductsToCategoryLeaves({ assignments });
    const again = await reassignProductsToCategoryLeaves({ assignments });
    assert.equal(again.reassigned, 0);
    assert.equal(again.skippedAlreadyCategorized, 1);
  });

  it("нет товара или листа — пропускаем и называем в отчёте", async () => {
    const product = await createProduct();

    const summary = await reassignProductsToCategoryLeaves({
      assignments: {
        [String(product._id)]: "autos-accessories", // ветка, не лист
        aaaaaaaaaaaaaaaaaaaaaaaa: leaf.slug,
        bbbbbbbbbbbbbbbbbbbbbbbb: "no-such-slug",
      },
    });

    assert.equal(summary.reassigned, 0);
    assert.deepEqual(summary.missingProducts, ["aaaaaaaaaaaaaaaaaaaaaaaa"]);
    assert.deepEqual(summary.missingCategories.sort(), [
      "autos-accessories",
      "no-such-slug",
    ]);
  });
});
