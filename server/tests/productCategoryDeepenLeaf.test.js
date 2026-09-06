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
const { ProductModel, UserModel } = await import("../models/index.js");
const { createProductCategoryAdminController } = await import(
  "../controllers/Product/productCategoryAdminControllers.js"
);

/** Заглушка res: контроллер отвечает через successRes/errorRes. */
const captureResponse = () => {
  const captured = {};
  return {
    captured,
    res: {
      locals: {},
      status(code) {
        captured.status = code;
        return this;
      },
      json(body) {
        captured.body = body;
        return this;
      },
    },
  };
};

/** @param {Record<string, unknown>} body */
const createCategory = async (body) => {
  const { captured, res } = captureResponse();
  await createProductCategoryAdminController({ body }, res);
  return captured;
};

const createRootLeaf = () =>
  ProductCategoryModel.create({
    slug: "autos",
    labelRu: "Автомобили",
    parentId: null,
    depth: 0,
    pathSlugs: ["autos"],
    pathLabelRu: ["Автомобили"],
    // Корень-лист: товары лежат прямо в нём, подкатегорий нет.
    isLeaf: true,
    sortOrder: 0,
    legacyProductCategory: "autos",
  });

const createSeller = () =>
  UserModel.create({
    email: `cat-${Math.random().toString(36).slice(2)}@example.com`,
    passwordHash: "x".repeat(20),
    userName: `cat${Math.random().toString(36).slice(2, 9)}`,
  });

/** @param {unknown} categoryId @param {unknown} sellerId */
const createProductIn = (categoryId, sellerId) =>
  ProductModel.create({
    productName: `Товар ${Math.random().toString(36).slice(2, 7)}`,
    productPrice: 1000,
    productSeller: sellerId,
    productCategory: "autos",
    productCategoryId: categoryId,
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
 * Раньше это был тупик без выхода: подкатегорию под лист добавить нельзя, а
 * снять лист нельзя, пока в нём лежат товары. Категория с товарами навсегда
 * оставалась без подкатегорий — так «Автомобили» с 23 карточками нельзя было
 * разложить по полкам.
 */
describe("углубление категории-листа", () => {
  it("подкатегория создаётся, товары переезжают в неё, родитель становится веткой", async () => {
    const parent = await createRootLeaf();
    const seller = await createSeller();
    const first = await createProductIn(parent._id, seller._id);
    const second = await createProductIn(parent._id, seller._id);

    const { status, body } = await createCategory({
      slug: "shiny",
      labelRu: "Шины",
      parentId: String(parent._id),
      isLeaf: true,
    });

    assert.equal(status, 201);
    assert.equal(body.data.movedProductCount, 2);

    const child = await ProductCategoryModel.findOne({ slug: "shiny" }).lean();
    const freshParent = await ProductCategoryModel.findById(parent._id).lean();
    assert.equal(freshParent.isLeaf, false, "родитель больше не лист");

    for (const id of [first._id, second._id]) {
      const product = await ProductModel.findById(id).lean();
      assert.equal(
        String(product.productCategoryId),
        String(child._id),
        "товар переехал в новую подкатегорию",
      );
    }
  });

  it("под лист с товарами нельзя завести ветку: товарам некуда деться", async () => {
    const parent = await createRootLeaf();
    const seller = await createSeller();
    await createProductIn(parent._id, seller._id);

    const { status, body } = await createCategory({
      slug: "shiny",
      labelRu: "Шины",
      parentId: String(parent._id),
      isLeaf: false,
    });

    assert.equal(status, 400);
    assert.match(body.message, /должна быть листом/u);

    const freshParent = await ProductCategoryModel.findById(parent._id).lean();
    assert.equal(freshParent.isLeaf, true, "родитель не тронут");
  });

  it("лист без товаров просто перестаёт быть листом", async () => {
    const parent = await createRootLeaf();

    const { status, body } = await createCategory({
      slug: "shiny",
      labelRu: "Шины",
      parentId: String(parent._id),
      isLeaf: false,
    });

    assert.equal(status, 201);
    assert.equal(body.data.movedProductCount, 0);
    const freshParent = await ProductCategoryModel.findById(parent._id).lean();
    assert.equal(freshParent.isLeaf, false);
  });

  it("обычная ветка родителем работает как раньше", async () => {
    const parent = await ProductCategoryModel.create({
      slug: "home",
      labelRu: "Дом",
      parentId: null,
      depth: 0,
      pathSlugs: ["home"],
      pathLabelRu: ["Дом"],
      isLeaf: false,
      sortOrder: 0,
    });

    const { status, body } = await createCategory({
      slug: "posuda",
      labelRu: "Посуда",
      parentId: String(parent._id),
      isLeaf: true,
    });

    assert.equal(status, 201);
    assert.equal(body.data.movedProductCount, 0);
  });
});
