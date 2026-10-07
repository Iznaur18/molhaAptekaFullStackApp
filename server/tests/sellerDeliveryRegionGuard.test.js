import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { UserModel } = await import("../models/index.js");
const {
  PRODUCT_DELIVERY_CARRIER_LOBO,
  PRODUCT_DELIVERY_CARRIER_SELLER,
  SELLER_DELIVERY_OUT_OF_REGION_MESSAGE,
} = await import("@molha/api-contract");
const { getSellerCommerceDefaults, saveSellerCommerceDefaults } =
  await import("../services/seller/sellerCommerceDefaults.js");
const { findSellerDeliveryRegionBlock } =
  await import("../services/order/sellerDeliveryRegionGuard.js");

const GROZNY = {
  address: "г Грозный, ул Мира, 1",
  lat: 43.31,
  lon: 45.69,
  isDefault: true,
};

const createSeller = () =>
  UserModel.create({
    email: `seller-${Math.random().toString(36).slice(2)}@example.com`,
    passwordHash: "x".repeat(20),
    userName: `seller${Math.random().toString(36).slice(2, 9)}`,
    userRegionCode: "RU-CE",
  });

/** @param {unknown} sellerId @param {Record<string, unknown>} [overrides] */
const saveDefaults = (sellerId, overrides = {}) =>
  saveSellerCommerceDefaults({
    userId: String(sellerId),
    pickupLocations: [GROZNY],
    pickupEnabled: true,
    deliveryCarrier: PRODUCT_DELIVERY_CARRIER_SELLER,
    paymentMethods: ["cashOnDelivery"],
    regionCode: "RU-CE",
    ...overrides,
  });

/** @param {unknown} sellerId @param {string} buyerRegionCode @param {string} [carrier] */
const check = (sellerId, buyerRegionCode, carrier = PRODUCT_DELIVERY_CARRIER_SELLER) =>
  findSellerDeliveryRegionBlock({
    items: [{ sellerId, carrier, regionCode: "RU-CE" }],
    resolveBuyerRegionCode: () => buyerRegionCode,
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

describe("доставка продавца в другие регионы", () => {
  it("по умолчанию включена и никого не режет", async () => {
    const seller = await createSeller();
    assert.equal(await check(seller._id, "RU-MOW"), null);

    const saved = await saveDefaults(seller._id);
    assert.equal(saved.deliveryOutsideRegionEnabled, true);
    assert.equal(await check(seller._id, "RU-MOW"), null);
  });

  it("выключена — покупатель из другого региона получает отказ", async () => {
    const seller = await createSeller();
    const saved = await saveDefaults(seller._id, {
      deliveryOutsideRegionEnabled: false,
    });
    assert.equal(saved.deliveryOutsideRegionEnabled, false);

    assert.deepEqual(await check(seller._id, "RU-MOW"), {
      reason: "seller_region",
      message: SELLER_DELIVERY_OUT_OF_REGION_MESSAGE,
    });
    assert.equal(await check(seller._id, "RU-CE"), null);
    assert.equal((await check(seller._id, ""))?.reason, "buyer_region_unknown");
    // У ЛОБО своя, жёсткая зона — настройка продавца её не касается.
    assert.equal(
      await check(seller._id, "RU-MOW", PRODUCT_DELIVERY_CARRIER_LOBO),
      null,
    );
  });

  it("клиент без поля не снимает запрет", async () => {
    const seller = await createSeller();
    await saveDefaults(seller._id, { deliveryOutsideRegionEnabled: false });
    await saveDefaults(seller._id);

    const defaults = await getSellerCommerceDefaults(String(seller._id));
    assert.equal(defaults.deliveryOutsideRegionEnabled, false);
  });

  it("регион покупателя не спрашиваем, пока запрета нет", async () => {
    const seller = await createSeller();
    let asked = 0;
    await findSellerDeliveryRegionBlock({
      items: [
        {
          sellerId: seller._id,
          carrier: PRODUCT_DELIVERY_CARRIER_SELLER,
          regionCode: "",
        },
      ],
      resolveBuyerRegionCode: () => {
        asked += 1;
        return "RU-MOW";
      },
    });
    assert.equal(asked, 0);
  });
});
