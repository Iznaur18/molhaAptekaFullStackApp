import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const {
  PRODUCT_CATEGORY_LABEL_RU_MAX_LENGTH,
  PRODUCT_CATEGORY_SEARCH_KEYWORD_MAX_LENGTH,
  PRODUCT_CATEGORY_SEARCH_KEYWORDS_MAX_COUNT,
  PRODUCT_CATEGORY_SLUG_MAX_LENGTH,
  PRODUCT_CATEGORY_TREE_MAX_DEPTH,
} = await import("../constants/productCategoryTreeConstants.js");
const { PRODUCT_CATEGORY_CATALOG_SEED } =
  await import("../constants/productCategoryCatalogSeed.js");
const { default: ProductCategoryModel } =
  await import("../models/ProductCategoryModel.js");
const { default: ProductCategoryDisplayModel } =
  await import("../models/ProductCategoryDisplayModel.js");
const { default: OneCCategoryMappingModel } =
  await import("../models/OneCCategoryMappingModel.js");
const { default: ProductModel } = await import("../models/ProductModel.js");
const { UserModel } = await import("../models/index.js");
const { applyProductCategoryCatalogSeed } =
  await import("../services/product/applyProductCategoryCatalogSeed.js");

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

describe("зашитое дерево категорий — данные", () => {
  it("слаги уникальны и проходят формат контракта", () => {
    const seen = new Set();
    for (const { rootSlug, nodes } of PRODUCT_CATEGORY_CATALOG_SEED) {
      assert.ok(!seen.has(rootSlug), `дубль корня ${rootSlug}`);
      seen.add(rootSlug);
      for (const node of nodes) {
        assert.match(node.slug, SLUG_PATTERN);
        assert.ok(node.slug.length <= PRODUCT_CATEGORY_SLUG_MAX_LENGTH, node.slug);
        assert.ok(!seen.has(node.slug), `дубль slug ${node.slug}`);
        seen.add(node.slug);
      }
    }
  });

  it("родитель объявлен раньше ребёнка, глубина и лимиты соблюдены", () => {
    for (const { rootSlug, nodes } of PRODUCT_CATEGORY_CATALOG_SEED) {
      const depthBySlug = new Map([[rootSlug, 0]]);
      for (const node of nodes) {
        const parentDepth = depthBySlug.get(node.parentSlug ?? rootSlug);
        assert.notEqual(parentDepth, undefined, `нет родителя для ${node.slug}`);
        assert.ok(parentDepth + 1 <= PRODUCT_CATEGORY_TREE_MAX_DEPTH, node.slug);
        depthBySlug.set(node.slug, parentDepth + 1);

        assert.ok(node.labelRu.trim().length > 0, node.slug);
        assert.ok(node.labelRu.length <= PRODUCT_CATEGORY_LABEL_RU_MAX_LENGTH);
        const keywords = node.searchKeywords ?? [];
        assert.ok(keywords.length <= PRODUCT_CATEGORY_SEARCH_KEYWORDS_MAX_COUNT);
        for (const keyword of keywords) {
          assert.ok(keyword.length <= PRODUCT_CATEGORY_SEARCH_KEYWORD_MAX_LENGTH);
        }
      }
    }
  });

  it("у соседей нет одинаковых названий, у ветки не один ребёнок", () => {
    for (const { rootSlug, nodes } of PRODUCT_CATEGORY_CATALOG_SEED) {
      const childrenByParent = new Map();
      for (const node of nodes) {
        const parentSlug = node.parentSlug ?? rootSlug;
        childrenByParent.set(parentSlug, [
          ...(childrenByParent.get(parentSlug) ?? []),
          node.labelRu,
        ]);
      }
      for (const [parentSlug, labels] of childrenByParent) {
        assert.equal(new Set(labels).size, labels.length, `дубли в ${parentSlug}`);
        if (parentSlug !== rootSlug) {
          assert.ok(labels.length > 1, `один ребёнок у ${parentSlug}`);
        }
      }
    }
  });
});

/** @param {Record<string, unknown>} [overrides] */
const createRoot = (overrides = {}) =>
  ProductCategoryModel.create({
    slug: "autos",
    labelRu: "Автомобили",
    parentId: null,
    depth: 0,
    pathSlugs: ["autos"],
    pathLabelRu: ["Автомобили"],
    isLeaf: false,
    sortOrder: 7,
    legacyProductCategory: "autos",
    ...overrides,
  });

/**
 * @param {import('mongoose').Document & Record<string, any>} root
 * @param {string} slug
 * @param {string} labelRu
 */
const createLeafUnder = (root, slug, labelRu) =>
  ProductCategoryModel.create({
    slug,
    labelRu,
    parentId: root._id,
    depth: 1,
    pathSlugs: [root.slug, slug],
    pathIds: [root._id],
    pathLabelRu: [root.labelRu, labelRu],
    isLeaf: true,
  });

const TEST_SEED = [
  {
    rootSlug: "autos",
    nodes: [
      { slug: "autos-parts", labelRu: "Запчасти", searchKeywords: ["Расходники"] },
      { slug: "autos-parts-filters", labelRu: "Фильтры", parentSlug: "autos-parts" },
      { slug: "autos-parts-belts", labelRu: "Ремни", parentSlug: "autos-parts" },
      { slug: "autos-wheels", labelRu: "Шины и диски" },
    ],
  },
];

describe("applyProductCategoryCatalogSeed", () => {
  before(async () => {
    await connectMongoTestReplSet();
  });

  after(async () => {
    await disconnectMongoTestReplSet();
  });

  beforeEach(async () => {
    await clearMongoCollections();
  });

  it("строит дерево под существующим корнем и не трогает сам корень", async () => {
    const root = await createRoot();

    const summary = await applyProductCategoryCatalogSeed({ seed: TEST_SEED });

    assert.equal(summary.rootsApplied, 1);
    assert.equal(summary.upsertedCategories, 4);

    const rootAfter = await ProductCategoryModel.findById(root._id).lean();
    assert.equal(rootAfter.labelRu, "Автомобили");
    assert.equal(rootAfter.sortOrder, 7);

    const branch = await ProductCategoryModel.findOne({ slug: "autos-parts" }).lean();
    assert.equal(branch.isLeaf, false);
    assert.equal(String(branch.parentId), String(root._id));
    assert.deepEqual(branch.searchKeywords, ["расходники"]);

    const leaf = await ProductCategoryModel.findOne({
      slug: "autos-parts-belts",
    }).lean();
    assert.equal(leaf.isLeaf, true);
    assert.equal(leaf.depth, 2);
    assert.equal(leaf.sortOrder, 20);
    assert.deepEqual(leaf.pathSlugs, ["autos", "autos-parts", "autos-parts-belts"]);
    assert.deepEqual(leaf.pathLabelRu, ["Автомобили", "Запчасти", "Ремни"]);
    assert.deepEqual(leaf.pathIds.map(String), [String(root._id), String(branch._id)]);
  });

  it("удаляет лишние подкатегории, а их товары оставляет в корне", async () => {
    const root = await createRoot();
    const oldLeaf = await createLeafUnder(root, "auto-stuff", "Автотовары");
    const seller = await UserModel.create({
      userName: "seed_seller",
      email: "seed_seller@t.local",
      passwordHash: "h",
    });
    const product = await ProductModel.create({
      productName: "Масло",
      productPrice: 100,
      productSeller: seller._id,
      productCategory: "autos",
      productCategoryId: oldLeaf._id,
      categoryPathIds: [root._id, oldLeaf._id],
      categoryBreadcrumbRu: "Автомобили › Автотовары",
    });
    await ProductCategoryDisplayModel.collection.insertOne({
      categoryId: oldLeaf._id,
      categorySlug: null,
      customLabel: "Старая плитка",
    });
    const mapping = await OneCCategoryMappingModel.create({
      sellerId: seller._id,
      externalId: "group-1",
      categoryId: oldLeaf._id,
    });

    const summary = await applyProductCategoryCatalogSeed({ seed: TEST_SEED });

    assert.equal(summary.deletedCategories, 1);
    assert.equal(summary.detachedProducts, 1);
    assert.equal(await ProductCategoryModel.countDocuments({ slug: "auto-stuff" }), 0);
    assert.equal(await ProductCategoryDisplayModel.countDocuments({}), 0);

    const productAfter = await ProductModel.findById(product._id).lean();
    assert.equal(productAfter.productCategory, "autos");
    assert.equal(productAfter.productCategoryId, null);
    assert.deepEqual(productAfter.categoryPathIds, []);

    const mappingAfter = await OneCCategoryMappingModel.findById(mapping._id).lean();
    assert.equal(mappingAfter.categoryId, null);
  });

  it("dryRun считает то же самое и ничего не пишет", async () => {
    const root = await createRoot();
    await createLeafUnder(root, "auto-stuff", "Автотовары");

    const summary = await applyProductCategoryCatalogSeed({
      seed: TEST_SEED,
      dryRun: true,
    });

    assert.equal(summary.upsertedCategories, 4);
    assert.equal(summary.deletedCategories, 1);
    assert.equal(await ProductCategoryModel.countDocuments({}), 2);
  });

  it("корень-лист становится веткой, повторный запуск ничего не меняет", async () => {
    const root = await createRoot({ isLeaf: true });

    await applyProductCategoryCatalogSeed({ seed: TEST_SEED });
    const idsAfterFirstRun = (
      await ProductCategoryModel.find({}).sort({ slug: 1 }).lean()
    ).map((doc) => String(doc._id));
    const second = await applyProductCategoryCatalogSeed({ seed: TEST_SEED });

    assert.equal((await ProductCategoryModel.findById(root._id).lean()).isLeaf, false);
    assert.equal(second.deletedCategories, 0);
    assert.deepEqual(
      (await ProductCategoryModel.find({}).sort({ slug: 1 }).lean()).map((doc) =>
        String(doc._id),
      ),
      idsAfterFirstRun,
    );
  });

  it("пропускает корень, которого нет в базе, и не трогает чужие корни", async () => {
    const electronics = await createRoot({
      slug: "electronics",
      labelRu: "Электроника",
      pathSlugs: ["electronics"],
      pathLabelRu: ["Электроника"],
      legacyProductCategory: "electronics",
    });
    await createLeafUnder(electronics, "smartphones", "Смартфоны и телефоны");

    const summary = await applyProductCategoryCatalogSeed({ seed: TEST_SEED });

    assert.deepEqual(summary.skippedRoots, ["autos"]);
    assert.equal(summary.rootsApplied, 0);
    assert.equal(await ProductCategoryModel.countDocuments({}), 2);
  });

  it("отказывается писать, если слаг сида занят в другом корне", async () => {
    await createRoot();
    const electronics = await createRoot({
      slug: "electronics",
      labelRu: "Электроника",
      pathSlugs: ["electronics"],
      pathLabelRu: ["Электроника"],
      legacyProductCategory: "electronics",
    });
    await createLeafUnder(electronics, "autos-wheels", "Чужой узел");

    await assert.rejects(
      applyProductCategoryCatalogSeed({ seed: TEST_SEED }),
      /уже занят в корне "electronics"/,
    );
    assert.equal(await ProductCategoryModel.countDocuments({}), 3);
  });
});
