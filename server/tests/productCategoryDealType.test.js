import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { CATEGORY_DEAL_TYPE_NOT_PURCHASABLE_MESSAGE } =
  await import("@molha/api-contract");
const { default: ProductCategoryModel } =
  await import("../models/ProductCategoryModel.js");
const { ProductModel, UserModel } = await import("../models/index.js");
const { createProductCategoryAdminController, patchProductCategoryAdminController } =
  await import("../controllers/Product/productCategoryAdminControllers.js");
const { filterCartItemsToPurchasableProducts } =
  await import("../controllers/Cart/cartItemHelpers.js");
const { assertProductsPurchasableViaCart } =
  await import("../services/order/createOrder.js");
const { toProductCategoryPublicPayload } =
  await import("../services/product/toProductCategoryPublicPayload.js");

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
  assert.equal(captured.status, 201, JSON.stringify(captured.body));
  return captured.body.data.category;
};

/** @param {string} categoryId @param {Record<string, unknown>} body */
const patchCategory = async (categoryId, body) => {
  const { captured, res } = captureResponse();
  await patchProductCategoryAdminController({ params: { categoryId }, body }, res);
  assert.equal(captured.body?.success, true, JSON.stringify(captured.body));
  return captured.body.data.category;
};

const createSeller = () =>
  UserModel.create({
    email: `deal-${Math.random().toString(36).slice(2)}@example.com`,
    passwordHash: "x".repeat(20),
    userName: `deal${Math.random().toString(36).slice(2, 9)}`,
  });

/** @param {unknown} categoryId @param {unknown} sellerId */
const createProductIn = (categoryId, sellerId) =>
  ProductModel.create({
    productName: `Объявление ${Math.random().toString(36).slice(2, 7)}`,
    productPrice: 1000,
    productSeller: sellerId,
    productCategory: "autos",
    productCategoryId: categoryId,
    productModerationStatus: "approved",
    productIsAvailable: true,
    productStockQuantity: 1,
  });

/** Корень «Автомобили» с двумя листами: легковые и запчасти. */
const createAutosTree = async () => {
  const root = await createCategory({ slug: "autos", labelRu: "Автомобили" });
  const cars = await createCategory({
    slug: "autos-cars",
    labelRu: "Легковые",
    parentId: root._id,
    isLeaf: true,
  });
  const parts = await createCategory({
    slug: "autos-parts",
    labelRu: "Запчасти",
    parentId: root._id,
    isLeaf: true,
  });
  return { root, cars, parts };
};

before(async () => {
  await connectMongoTestReplSet();
});

after(async () => {
  await disconnectMongoTestReplSet();
});

beforeEach(async () => {
  await clearMongoCollections();
});

describe("тип сделки категории", () => {
  it("по умолчанию всё — обычный товар", async () => {
    const { root, cars } = await createAutosTree();

    assert.equal(root.dealType, null);
    assert.equal(root.effectiveDealType, "goods");
    assert.equal(cars.effectiveDealType, "goods");
  });

  it("тип корня доходит до подкатегорий и до их товаров", async () => {
    const { root, cars } = await createAutosTree();
    const seller = await createSeller();
    const product = await createProductIn(cars._id, seller._id);

    const patched = await patchCategory(root._id, { dealType: "viewing" });
    assert.equal(patched.dealType, "viewing");
    assert.equal(patched.effectiveDealType, "viewing");

    const freshCars = await ProductCategoryModel.findById(cars._id).lean();
    assert.equal(freshCars.dealType, null, "свой выбор подкатегории не появился");
    assert.equal(freshCars.effectiveDealType, "viewing");
    assert.equal(toProductCategoryPublicPayload(freshCars).dealType, "viewing");

    const freshProduct = await ProductModel.findById(product._id).lean();
    assert.equal(freshProduct.productDealType, "viewing");
  });

  it("подкатегория со своим типом не подчиняется родителю", async () => {
    const { root, cars, parts } = await createAutosTree();
    const seller = await createSeller();
    const part = await createProductIn(parts._id, seller._id);

    // Запчасти — обычный товар с доставкой, хотя лежат в «Автомобилях».
    await patchCategory(parts._id, { dealType: "goods" });
    await patchCategory(root._id, { dealType: "viewing" });

    const freshParts = await ProductCategoryModel.findById(parts._id).lean();
    const freshCars = await ProductCategoryModel.findById(cars._id).lean();
    assert.equal(freshParts.effectiveDealType, "goods");
    assert.equal(freshCars.effectiveDealType, "viewing");
    assert.equal(
      (await ProductModel.findById(part._id).lean()).productDealType,
      "goods",
    );
  });

  it("сброс своего типа возвращает наследование", async () => {
    const { root, cars } = await createAutosTree();
    const seller = await createSeller();
    const product = await createProductIn(cars._id, seller._id);

    await patchCategory(root._id, { dealType: "viewing" });
    await patchCategory(cars._id, { dealType: "service" });
    assert.equal(
      (await ProductModel.findById(product._id).lean()).productDealType,
      "service",
    );

    const reset = await patchCategory(cars._id, { dealType: null });
    assert.equal(reset.dealType, null);
    assert.equal(reset.effectiveDealType, "viewing");
    assert.equal(
      (await ProductModel.findById(product._id).lean()).productDealType,
      "viewing",
    );
  });

  it("новая подкатегория сразу наследует тип родителя", async () => {
    const { root } = await createAutosTree();
    await patchCategory(root._id, { dealType: "viewing" });

    const moto = await createCategory({
      slug: "autos-moto",
      labelRu: "Мотоциклы",
      parentId: root._id,
      isLeaf: true,
    });
    assert.equal(moto.effectiveDealType, "viewing");
  });
});

describe("объявление без корзины", () => {
  it("корзина молча выбрасывает авто и оставляет запчасть", async () => {
    const { cars, parts } = await createAutosTree();
    const seller = await createSeller();
    const car = await createProductIn(cars._id, seller._id);
    const part = await createProductIn(parts._id, seller._id);
    await patchCategory(cars._id, { dealType: "viewing" });

    const kept = await filterCartItemsToPurchasableProducts({
      [String(car._id)]: 1,
      [String(part._id)]: 2,
    });

    assert.deepEqual(kept, { [String(part._id)]: 2 });
  });

  it("товар, созданный до появления поля, остаётся покупаемым", async () => {
    const { parts } = await createAutosTree();
    const seller = await createSeller();
    const legacy = await createProductIn(parts._id, seller._id);
    await ProductModel.collection.updateOne(
      { _id: legacy._id },
      { $unset: { productDealType: "" } },
    );

    const kept = await filterCartItemsToPurchasableProducts({
      [String(legacy._id)]: 1,
    });
    assert.deepEqual(kept, { [String(legacy._id)]: 1 });
    await assert.doesNotReject(assertProductsPurchasableViaCart([String(legacy._id)]));
  });

  it("заказ на авто отклоняется с понятным текстом", async () => {
    const { cars } = await createAutosTree();
    const seller = await createSeller();
    const car = await createProductIn(cars._id, seller._id);
    await patchCategory(cars._id, { dealType: "viewing" });

    await assert.rejects(assertProductsPurchasableViaCart([String(car._id)]), {
      statusCode: 400,
      message: CATEGORY_DEAL_TYPE_NOT_PURCHASABLE_MESSAGE,
    });
  });
});
