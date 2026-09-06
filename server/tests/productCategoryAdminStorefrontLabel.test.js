import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { default: ProductCategoryModel } = await import(
  "../models/ProductCategoryModel.js"
);
const { default: ProductCategoryDisplayModel } = await import(
  "../models/ProductCategoryDisplayModel.js"
);
const { listProductCategoriesAdminController } = await import(
  "../controllers/Product/productCategoryAdminControllers.js"
);

/** Заглушка res: контроллер отвечает через successRes. */
const captureResponse = () => {
  const captured = {};
  return {
    captured,
    res: {
      status() {
        return this;
      },
      json(body) {
        captured.body = body;
        return this;
      },
    },
  };
};

const listCategories = async () => {
  const { captured, res } = captureResponse();
  await listProductCategoriesAdminController({}, res);
  return captured.body.data.categories;
};

/** @param {Record<string, unknown>} [overrides] */
const createCategory = (overrides = {}) =>
  ProductCategoryModel.create({
    slug: "autos",
    labelRu: "Автомобили",
    parentId: null,
    depth: 0,
    pathSlugs: ["autos"],
    pathLabelRu: ["Автомобили"],
    isLeaf: false,
    sortOrder: 0,
    ...overrides,
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

/**
 * Дерево категорий и витрина — разные вещи: labelRu уходит в карточки товаров и
 * хлебные крошки, а customLabel меняет только подпись плитки. Пока админка
 * дерева не знала про переопределение, переименованную категорию в ней было не
 * найти: на витрине «Транспорт и запчасти», в дереве «Автомобили».
 */
describe("подпись плитки в админке дерева", () => {
  it("отдаётся вместе с категорией, когда плитку переименовали по слагу", async () => {
    await createCategory();
    await ProductCategoryDisplayModel.create({
      categorySlug: "autos",
      customLabel: "Транспорт и запчасти",
    });

    const [category] = await listCategories();

    assert.equal(category.labelRu, "Автомобили");
    assert.equal(category.storefrontLabel, "Транспорт и запчасти");
  });

  it("работает и когда переопределение заведено по id узла", async () => {
    const category = await createCategory({ slug: "acses", labelRu: "Аксессуары" });
    await ProductCategoryDisplayModel.create({
      categoryId: category._id,
      customLabel: "Аксессуары и мелочи",
    });

    const [row] = await listCategories();

    assert.equal(row.storefrontLabel, "Аксессуары и мелочи");
  });

  it("без переименования — null, а не пустая строка", async () => {
    await createCategory();

    const [category] = await listCategories();

    assert.equal(category.storefrontLabel, null);
  });

  it("переопределение чужой категории на эту не налипает", async () => {
    await createCategory();
    await ProductCategoryDisplayModel.create({
      categorySlug: "clothes",
      customLabel: "Одежда и обувь",
    });

    const [category] = await listCategories();

    assert.equal(category.storefrontLabel, null);
  });

  it("пустая подпись считается отсутствующей", async () => {
    await createCategory();
    await ProductCategoryDisplayModel.create({
      categorySlug: "autos",
      customLabel: "   ",
    });

    const [category] = await listCategories();

    assert.equal(category.storefrontLabel, null);
  });
});
