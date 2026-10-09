import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { PRODUCT_CHARACTERISTICS_MAX_ITEMS, PRODUCT_CHARACTERISTIC_KEY_MAX_CHARS } =
  await import("../constants/productCharacteristicsConstants.js");
const { PRODUCT_CATEGORY_CATALOG_SEED } =
  await import("../constants/productCategoryCatalogSeed.js");
const { PRODUCT_CATEGORY_DEFAULT_CHARACTERISTICS_SEED } =
  await import("../constants/productCategoryDefaultCharacteristicsSeed.js");
const { default: ProductCategoryModel } =
  await import("../models/ProductCategoryModel.js");
const {
  applyProductCategoryDefaultCharacteristics,
  resolveSeedDefaultCharacteristicKeys,
} = await import("../services/product/applyProductCategoryDefaultCharacteristics.js");

describe("встроенные характеристики категорий — данные", () => {
  it("каждый слаг списка есть в зашитом дереве", () => {
    const treeSlugs = new Set(
      PRODUCT_CATEGORY_CATALOG_SEED.flatMap(({ nodes }) =>
        nodes.map((node) => node.slug),
      ),
    );
    for (const slug of Object.keys(PRODUCT_CATEGORY_DEFAULT_CHARACTERISTICS_SEED)) {
      assert.ok(treeSlugs.has(slug), `нет узла ${slug}`);
    }
  });

  it("списки укладываются в лимиты и не содержат повторов", () => {
    for (const [slug, keys] of Object.entries(
      PRODUCT_CATEGORY_DEFAULT_CHARACTERISTICS_SEED,
    )) {
      assert.ok(keys.length > 0, slug);
      assert.ok(keys.length <= PRODUCT_CHARACTERISTICS_MAX_ITEMS, slug);
      assert.equal(
        new Set(keys.map((key) => key.toLowerCase())).size,
        keys.length,
        `повтор в ${slug}`,
      );
      for (const key of keys) {
        assert.equal(key, key.trim(), `${slug}: ${key}`);
        assert.ok(key.length > 0, slug);
        assert.ok(
          key.length <= PRODUCT_CHARACTERISTIC_KEY_MAX_CHARS,
          `${slug}: ${key}`,
        );
      }
    }
  });

  it("у каждой конечной подкатегории дерева есть список", () => {
    for (const { rootSlug, nodes } of PRODUCT_CATEGORY_CATALOG_SEED) {
      const parentBySlug = new Map(
        nodes.map((node) => [node.slug, node.parentSlug ?? rootSlug]),
      );
      const parentSlugs = new Set(parentBySlug.values());

      for (const node of nodes) {
        if (parentSlugs.has(node.slug)) continue;

        const pathSlugs = [];
        for (let slug = node.slug; slug; slug = parentBySlug.get(slug)) {
          pathSlugs.unshift(slug);
        }
        assert.ok(
          resolveSeedDefaultCharacteristicKeys(pathSlugs).length > 0,
          `нет списка для ${node.slug}`,
        );
      }
    }
  });
});

const TEST_SEED = {
  "autos-wheels": ["Бренд", "Диаметр"],
  "autos-wheels-tires": ["Бренд", "Сезон", "Ширина"],
};

/**
 * @param {string} slug
 * @param {string[]} pathSlugs
 * @param {Record<string, unknown>} [overrides]
 */
const createLeaf = (slug, pathSlugs, overrides = {}) =>
  ProductCategoryModel.create({
    slug,
    labelRu: slug,
    parentId: null,
    depth: pathSlugs.length - 1,
    pathSlugs,
    pathLabelRu: pathSlugs,
    isLeaf: true,
    ...overrides,
  });

/** @param {string} slug */
const readKeys = async (slug) =>
  (await ProductCategoryModel.findOne({ slug }).lean()).defaultCharacteristicKeys;

describe("applyProductCategoryDefaultCharacteristics", () => {
  before(async () => {
    await connectMongoTestReplSet();
  });

  after(async () => {
    await disconnectMongoTestReplSet();
  });

  beforeEach(async () => {
    await clearMongoCollections();
  });

  it("лист берёт свой список, а без своего — список ближайшей группы", async () => {
    await createLeaf("autos-wheels-tires", [
      "autos",
      "autos-wheels",
      "autos-wheels-tires",
    ]);
    await createLeaf("autos-wheels-rims", [
      "autos",
      "autos-wheels",
      "autos-wheels-rims",
    ]);

    const summary = await applyProductCategoryDefaultCharacteristics({
      seed: TEST_SEED,
    });

    assert.equal(summary.leavesFilled, 2);
    assert.deepEqual(await readKeys("autos-wheels-tires"), [
      "Бренд",
      "Сезон",
      "Ширина",
    ]);
    assert.deepEqual(await readKeys("autos-wheels-rims"), ["Бренд", "Диаметр"]);
  });

  it("не трогает список, введённый в админке, и листья вне сида", async () => {
    await createLeaf(
      "autos-wheels-tires",
      ["autos", "autos-wheels", "autos-wheels-tires"],
      { defaultCharacteristicKeys: ["Состояние"] },
    );
    await createLeaf("smartphones", ["electronics", "smartphones"]);

    const summary = await applyProductCategoryDefaultCharacteristics({
      seed: TEST_SEED,
    });

    assert.equal(summary.leavesFilled, 0);
    assert.equal(summary.leavesAlreadyFilled, 1);
    assert.equal(summary.leavesWithoutSeed, 1);
    assert.deepEqual(await readKeys("autos-wheels-tires"), ["Состояние"]);
    assert.deepEqual(await readKeys("smartphones"), []);
  });

  it("dryRun считает, но не пишет; повторный запуск ничего не меняет", async () => {
    await createLeaf("autos-wheels-rims", [
      "autos",
      "autos-wheels",
      "autos-wheels-rims",
    ]);

    const dry = await applyProductCategoryDefaultCharacteristics({
      seed: TEST_SEED,
      dryRun: true,
    });
    assert.equal(dry.leavesFilled, 1);
    assert.deepEqual(await readKeys("autos-wheels-rims"), []);

    await applyProductCategoryDefaultCharacteristics({ seed: TEST_SEED });
    const second = await applyProductCategoryDefaultCharacteristics({
      seed: TEST_SEED,
    });
    assert.equal(second.leavesFilled, 0);
    assert.equal(second.leavesAlreadyFilled, 1);
  });
});
