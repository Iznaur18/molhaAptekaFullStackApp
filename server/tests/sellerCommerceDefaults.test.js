import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { ProductModel, UserModel } = await import("../models/index.js");
const {
  PRODUCT_DELIVERY_CARRIER_GITORG,
  PRODUCT_DELIVERY_CARRIER_SELLER,
  PRODUCT_FULFILLMENT_SOURCE_CUSTOM,
  PRODUCT_FULFILLMENT_SOURCE_PROFILE,
} = await import("@molha/api-contract");
const {
  getSellerCommerceDefaults,
  saveSellerCommerceDefaults,
} = await import("../services/seller/sellerCommerceDefaults.js");
const { buildProductPatchSet } = await import(
  "../services/product/buildProductPatchSet.js"
);

const GROZNY = {
  address: "г Грозный, ул Мира, 1",
  lat: 43.31,
  lon: 45.69,
  isDefault: true,
};
const MOSCOW = {
  address: "г Москва, ул Тверская, 1",
  lat: 55.757,
  lon: 37.615,
  isDefault: true,
};

/** @param {Record<string, unknown>} [overrides] */
const createSeller = (overrides = {}) =>
  UserModel.create({
    email: `seller-${Math.random().toString(36).slice(2)}@example.com`,
    passwordHash: "x".repeat(20),
    userName: `seller${Math.random().toString(36).slice(2, 9)}`,
    userRegionCode: "RU-CE",
    ...overrides,
  });

/**
 * @param {unknown} sellerId
 * @param {Record<string, unknown>} [overrides]
 */
const createProduct = (sellerId, overrides = {}) =>
  ProductModel.create({
    productName: "Товар для проверки настроек продавца",
    productDescription: "Описание достаточной длины для проверок",
    productPrice: 1000,
    productSeller: sellerId,
    productCategory: "electronics",
    productListingOrigin: "own",
    productRegionCode: "RU-CE",
    productPickupAddress: GROZNY.address,
    productPickupLat: GROZNY.lat,
    productPickupLon: GROZNY.lon,
    productPickupLocation: { type: "Point", coordinates: [GROZNY.lon, GROZNY.lat] },
    productPickupLocations: [{ id: "p1", ...GROZNY }],
    productPickupEnabled: true,
    productDeliveryCarrier: PRODUCT_DELIVERY_CARRIER_SELLER,
    productDeliveryEnabled: true,
    ...overrides,
  });

/** @param {unknown} sellerId @param {Record<string, unknown>} [overrides] */
const saveDefaults = (sellerId, overrides = {}) =>
  saveSellerCommerceDefaults({
    userId: String(sellerId),
    pickupLocations: [MOSCOW],
    pickupEnabled: true,
    deliveryCarrier: PRODUCT_DELIVERY_CARRIER_SELLER,
    paymentMethods: ["cashOnDelivery"],
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

describe("настройки доставки продавца", () => {
  it("до настройки профиль пуст, но оплаты уже все", async () => {
    const seller = await createSeller();
    const defaults = await getSellerCommerceDefaults(String(seller._id));

    assert.equal(defaults.fulfillmentConfigured, false);
    assert.deepEqual(defaults.paymentMethods, [
      "cashOnDelivery",
      "cardPrepaid",
      "cardOnDelivery",
    ]);
    assert.equal(defaults.followingProductCount, 0);
  });

  it("сохранение переписывает товары, следующие профилю", async () => {
    const seller = await createSeller();
    const following = await createProduct(seller._id, {
      productFulfillmentSource: PRODUCT_FULFILLMENT_SOURCE_PROFILE,
    });
    const own = await createProduct(seller._id, {
      productFulfillmentSource: PRODUCT_FULFILLMENT_SOURCE_CUSTOM,
    });

    await saveDefaults(seller._id);

    const followingAfter = await ProductModel.findById(following._id).lean();
    const ownAfter = await ProductModel.findById(own._id).lean();

    assert.equal(followingAfter.productPickupAddress, MOSCOW.address);
    assert.equal(followingAfter.productPickupLat, MOSCOW.lat);
    assert.deepEqual(followingAfter.productPickupLocation.coordinates, [
      MOSCOW.lon,
      MOSCOW.lat,
    ]);
    assert.equal(
      ownAfter.productPickupAddress,
      GROZNY.address,
      "товар со своими настройками пересинк не трогает",
    );
  });

  it("товар без явного источника считается своим и не переезжает", async () => {
    const seller = await createSeller();
    // Старый документ: поля вообще нет.
    const legacy = await createProduct(seller._id);
    await ProductModel.updateOne(
      { _id: legacy._id },
      { $unset: { productFulfillmentSource: 1 } },
    );

    await saveDefaults(seller._id);

    const after = await ProductModel.findById(legacy._id).lean();
    assert.equal(after.productPickupAddress, GROZNY.address);
  });

  it("смена перевозчика в профиле разъезжается по товарам вместе с флагами", async () => {
    const seller = await createSeller();
    const product = await createProduct(seller._id, {
      productFulfillmentSource: PRODUCT_FULFILLMENT_SOURCE_PROFILE,
    });

    await saveDefaults(seller._id, {
      deliveryCarrier: PRODUCT_DELIVERY_CARRIER_GITORG,
    });

    const after = await ProductModel.findById(product._id).lean();
    assert.equal(after.productDeliveryCarrier, PRODUCT_DELIVERY_CARRIER_GITORG);
    assert.equal(after.productCourierDeliveryEnabled, true);
    assert.equal(
      after.productDeliveryEnabled,
      false,
      "легаси-флаги не должны разъезжаться с перевозчиком",
    );
  });

  it("настройка без единого способа получения не сохраняется", async () => {
    const seller = await createSeller();
    await assert.rejects(
      saveDefaults(seller._id, { pickupEnabled: false, deliveryCarrier: "" }),
      /получения|способ/i,
    );
  });

  it("пустой список оплат читается как «принимаю всё»", async () => {
    const seller = await createSeller();
    const saved = await saveDefaults(seller._id, { paymentMethods: [] });
    assert.deepEqual(saved.paymentMethods, [
      "cashOnDelivery",
      "cardPrepaid",
      "cardOnDelivery",
    ]);
  });
});

describe("источник настроек на товаре", () => {
  it("перевод на профиль подставляет адрес продавца", async () => {
    const seller = await createSeller();
    await saveDefaults(seller._id);
    const product = await createProduct(seller._id, {
      productFulfillmentSource: PRODUCT_FULFILLMENT_SOURCE_CUSTOM,
    });

    const { $set } = await buildProductPatchSet({
      existing: product,
      body: { productFulfillmentSource: PRODUCT_FULFILLMENT_SOURCE_PROFILE },
      isAdmin: false,
      productId: String(product._id),
    });

    assert.equal($set.productFulfillmentSource, PRODUCT_FULFILLMENT_SOURCE_PROFILE);
    assert.equal($set.productPickupAddress, MOSCOW.address);
    assert.deepEqual($set.productPickupLocation.coordinates, [MOSCOW.lon, MOSCOW.lat]);
  });

  it("перевод на профиль без настроек отклоняется", async () => {
    const seller = await createSeller();
    const product = await createProduct(seller._id);

    await assert.rejects(
      buildProductPatchSet({
        existing: product,
        body: { productFulfillmentSource: PRODUCT_FULFILLMENT_SOURCE_PROFILE },
        isAdmin: false,
        productId: String(product._id),
      }),
      /профил/i,
    );
  });

  it("правка адреса отвязывает товар от профиля", async () => {
    const seller = await createSeller();
    await saveDefaults(seller._id);
    const product = await createProduct(seller._id, {
      productFulfillmentSource: PRODUCT_FULFILLMENT_SOURCE_PROFILE,
    });

    const { $set } = await buildProductPatchSet({
      existing: product,
      body: { productPickupEnabled: false },
      isAdmin: false,
      productId: String(product._id),
    });

    assert.equal(
      $set.productFulfillmentSource,
      PRODUCT_FULFILLMENT_SOURCE_CUSTOM,
      "иначе следующее сохранение профиля молча вернуло бы самовывоз",
    );
  });

  it("мобилка прислала прежний адрес — товар остаётся за профилем", async () => {
    const seller = await createSeller();
    const product = await createProduct(seller._id, {
      productFulfillmentSource: PRODUCT_FULFILLMENT_SOURCE_PROFILE,
    });

    // Старый клиент шлёт адрес при любом сохранении товара, даже если правил
    // одну цену. Отвязка на этом означала бы потерю управления из профиля.
    const { $set } = await buildProductPatchSet({
      existing: product,
      body: {
        productPrice: 2000,
        productPickupAddress: GROZNY.address,
        productPickupLat: GROZNY.lat,
        productPickupLon: GROZNY.lon,
        productPickupEnabled: true,
        productDeliveryCarrier: PRODUCT_DELIVERY_CARRIER_SELLER,
      },
      isAdmin: false,
      productId: String(product._id),
    });

    assert.equal($set.productFulfillmentSource, undefined);
  });

  it("явный custom отвязывает, даже если ничего не поменялось", async () => {
    const seller = await createSeller();
    const product = await createProduct(seller._id, {
      productFulfillmentSource: PRODUCT_FULFILLMENT_SOURCE_PROFILE,
    });

    const { $set } = await buildProductPatchSet({
      existing: product,
      body: { productFulfillmentSource: PRODUCT_FULFILLMENT_SOURCE_CUSTOM },
      isAdmin: false,
      productId: String(product._id),
    });

    assert.equal($set.productFulfillmentSource, PRODUCT_FULFILLMENT_SOURCE_CUSTOM);
  });

  it("патч, не касающийся доставки, источник не меняет", async () => {
    const seller = await createSeller();
    const product = await createProduct(seller._id, {
      productFulfillmentSource: PRODUCT_FULFILLMENT_SOURCE_PROFILE,
    });

    const { $set } = await buildProductPatchSet({
      existing: product,
      body: { productPrice: 2000 },
      isAdmin: false,
      productId: String(product._id),
    });

    assert.equal($set.productFulfillmentSource, undefined);
  });
});
