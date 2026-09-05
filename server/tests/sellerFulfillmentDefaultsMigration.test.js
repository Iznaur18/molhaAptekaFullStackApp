import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const mongoose = (await import("mongoose")).default;
const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
// Пишем сырым драйвером, но модели импортируем: clearMongoCollections чистит
// только те коллекции, о которых знает mongoose, и без этого импорта тесты
// начинают видеть данные друг друга.
await import("../models/index.js");
const { up } = await import(
  "../scripts/migrations/20260905-seller-fulfillment-defaults.js"
);

const db = () => mongoose.connection.db;

const GROZNY = { address: "г Грозный, ул Мира, 1", lat: 43.31, lon: 45.69 };
const MOSCOW = { address: "г Москва, ул Тверская, 1", lat: 55.757, lon: 37.615 };

/** @param {string} name */
const insertSeller = async (name) => {
  const { insertedId } = await db()
    .collection("users")
    .insertOne({
      email: `${name}@example.com`,
      userName: name,
      passwordHash: "x".repeat(20),
    });
  return insertedId;
};

/**
 * Товар до миграции: `productFulfillmentSource` в таких документах нет вовсе.
 *
 * @param {unknown} sellerId
 * @param {{ address: string; lat: number; lon: number }} point
 * @param {Record<string, unknown>} [overrides]
 */
const insertLegacyProduct = async (sellerId, point, overrides = {}) => {
  const { insertedId } = await db()
    .collection("products")
    .insertOne({
      productName: "Товар",
      productPrice: 100,
      productSeller: sellerId,
      productCategory: "electronics",
      productRegionCode: "RU-CE",
      productPickupAddress: point.address,
      productPickupLat: point.lat,
      productPickupLon: point.lon,
      productPickupLocations: [{ id: "p1", ...point, label: "", isDefault: true }],
      productPickupEnabled: true,
      productDeliveryCarrier: "seller",
      productDeliveryEnabled: true,
      productCourierDeliveryEnabled: false,
      ...overrides,
    });
  return insertedId;
};

/** @param {unknown} id */
const readProduct = (id) => db().collection("products").findOne({ _id: id });
/** @param {unknown} id */
const readUser = (id) => db().collection("users").findOne({ _id: id });

before(async () => {
  await connectMongoTestReplSet();
});

after(async () => {
  await disconnectMongoTestReplSet();
});

beforeEach(async () => {
  await clearMongoCollections();
});

describe("миграция: посев настроек доставки продавца", () => {
  it("dry-run ничего не пишет", async () => {
    const seller = await insertSeller("dry");
    const productId = await insertLegacyProduct(seller, GROZNY);

    const report = await up({ db: db(), isApply: false });

    assert.equal(report.wouldMigrate, 1);
    assert.equal(report.sellers, 1);
    assert.equal((await readUser(seller)).sellerFulfillmentDefaults, undefined);
    assert.equal(
      (await readProduct(productId)).productFulfillmentSource,
      undefined,
      "dry-run обязан быть безобиден",
    );
  });

  it("в профиль попадает самая частая комбинация, редкая остаётся индивидуальной", async () => {
    const seller = await insertSeller("common");
    const grozny1 = await insertLegacyProduct(seller, GROZNY);
    const grozny2 = await insertLegacyProduct(seller, GROZNY);
    const moscow = await insertLegacyProduct(seller, MOSCOW);

    await up({ db: db(), isApply: true });

    const user = await readUser(seller);
    assert.equal(
      user.sellerFulfillmentDefaults.pickupLocations[0].address,
      GROZNY.address,
    );
    assert.equal(user.sellerFulfillmentDefaults.pickupLocations[0].isDefault, true);

    assert.equal((await readProduct(grozny1)).productFulfillmentSource, "profile");
    assert.equal((await readProduct(grozny2)).productFulfillmentSource, "profile");
    assert.equal(
      (await readProduct(moscow)).productFulfillmentSource,
      undefined,
      "склад в другом городе не должен молча переехать",
    );
  });

  it("разный перевозчик — разные комбинации", async () => {
    const seller = await insertSeller("carrier");
    // Два против одного: при равенстве победитель выбирается по подписи, и
    // тест проверял бы правило разрешения ничьей, а не смысл.
    const bySeller = await insertLegacyProduct(seller, GROZNY);
    await insertLegacyProduct(seller, GROZNY);
    const byCourier = await insertLegacyProduct(seller, GROZNY, {
      productDeliveryCarrier: "gitorg_courier",
      productDeliveryEnabled: false,
      productCourierDeliveryEnabled: true,
    });

    await up({ db: db(), isApply: true });

    assert.equal((await readProduct(bySeller)).productFulfillmentSource, "profile");
    assert.equal((await readProduct(byCourier)).productFulfillmentSource, undefined);
  });

  it("товар без координат наследовать нечему", async () => {
    const seller = await insertSeller("nogeo");
    const broken = await insertLegacyProduct(seller, GROZNY, {
      productPickupLat: null,
      productPickupLon: null,
      productPickupLocations: [],
    });

    const report = await up({ db: db(), isApply: true });

    assert.equal(report.sellers, 0);
    assert.equal((await readProduct(broken)).productFulfillmentSource, undefined);
    assert.equal((await readUser(seller)).sellerFulfillmentDefaults, undefined);
  });

  it("продавца с уже настроенным профилем миграция не трогает", async () => {
    const seller = await insertSeller("configured");
    await db()
      .collection("users")
      .updateOne(
        { _id: seller },
        {
          $set: {
            sellerFulfillmentDefaults: {
              pickupLocations: [
                { id: "profile-1", ...MOSCOW, label: "", isDefault: true },
              ],
              pickupEnabled: true,
              deliveryCarrier: "",
              regionCode: "RU-MOW",
            },
          },
        },
      );
    const productId = await insertLegacyProduct(seller, GROZNY);

    const report = await up({ db: db(), isApply: true });

    assert.equal(report.skippedAlreadyConfigured, 1);
    assert.equal(
      (await readUser(seller)).sellerFulfillmentDefaults.pickupLocations[0].address,
      MOSCOW.address,
      "выбор продавца новее нашей догадки",
    );
    assert.equal((await readProduct(productId)).productFulfillmentSource, undefined);
  });

  it("повторный прогон идемпотентен", async () => {
    const seller = await insertSeller("twice");
    const productId = await insertLegacyProduct(seller, GROZNY);

    await up({ db: db(), isApply: true });
    const second = await up({ db: db(), isApply: true });

    assert.equal(second.sellers, 0);
    assert.equal((await readProduct(productId)).productFulfillmentSource, "profile");
  });
});
