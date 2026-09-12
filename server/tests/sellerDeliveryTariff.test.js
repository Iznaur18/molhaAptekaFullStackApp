import assert from "node:assert/strict";
import { after, afterEach, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { UserModel } = await import("../models/index.js");
const {
  buildGoodsTotalBySeller,
  prepareSellerDeliveryBySeller,
  resolveSellerDeliveryFeesBySeller,
} = await import("../services/order/sellerDeliveryFee.js");
const { buildStoredShipments } = await import("../services/order/orderShipments.js");

/** Грозный → точка примерно в 11,1 км севернее по прямой. */
const ORIGIN = { lat: 43.3, lon: 45.7 };
const BUYER_GEO = { lat: 43.4, lon: 45.7 };

const TARIFF = { paid: true, baseFeeRub: 200, perKmRub: 30, freeFromRub: 5000 };

/** Адрес, уже проверенный DaData до дома. */
const VERIFIED_ADDRESS = {
  displayAddress: "г Грозный, ул Мира, д 19",
  flat: "",
  fiasId: "fias-house",
  geo: BUYER_GEO,
  geoPrecision: "house",
};

const REAL_FETCH = globalThis.fetch;
/** @type {string[]} */
let fetchedUrls = [];

/**
 * Подменяет внешние геосервисы.
 *
 * @param {(url: string) => { status?: number; body: unknown }} handler
 */
const stubGeoFetch = (handler) => {
  process.env.GEO_EXTERNAL_TEST = "1";
  process.env.GEO_NOMINATIM_INTERVAL_MS = "0";
  globalThis.fetch = async (input) => {
    const url = String(input);
    fetchedUrls.push(url);
    const { status = 200, body } = handler(url);
    return new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  };
};

/** @param {number} meters */
const osrmRoute = (meters) => ({
  code: "Ok",
  routes: [{ distance: meters }],
  waypoints: [{ distance: 0 }, { distance: 0 }],
});

/** @param {Record<string, unknown>} [tariff] */
const createSeller = (tariff = TARIFF) =>
  UserModel.create({
    email: `tariff-${Math.random().toString(36).slice(2)}@example.com`,
    passwordHash: "x".repeat(20),
    userName: `tariff${Math.random().toString(36).slice(2, 9)}`,
    sellerFulfillmentDefaults: {
      pickupLocations: [
        {
          id: "profile-1",
          label: "",
          address: "г Грозный, ул Мира, 1",
          ...ORIGIN,
          isDefault: true,
        },
      ],
      pickupEnabled: true,
      deliveryCarrier: "seller",
      regionCode: "RU-CE",
      deliveryTariff: tariff,
    },
  });

/**
 * @param {string} sellerId
 * @param {{ carrier?: string; clientGeo?: unknown }} [options]
 */
const prepare = (sellerId, options = {}) =>
  prepareSellerDeliveryBySeller({
    fulfillmentBySellerId: { [sellerId]: "delivery" },
    deliveryCarrierBySellerId: { [sellerId]: options.carrier ?? "seller" },
    productById: {
      p1: {
        sellerId,
        productPickupLat: ORIGIN.lat,
        productPickupLon: ORIGIN.lon,
        productPickupAddress: "г Грозный, ул Мира, 1",
      },
    },
    deliveryAddress: VERIFIED_ADDRESS,
    clientGeo: options.clientGeo ?? null,
  });

/**
 * @param {string} sellerId
 * @param {Awaited<ReturnType<typeof prepare>>} prepared
 * @param {number} [goods]
 */
const fees = (sellerId, prepared, goods = 1000) =>
  resolveSellerDeliveryFeesBySeller({
    preparedBySellerId: prepared,
    goodsTotalBySellerId: { [sellerId]: goods },
  });

before(async () => {
  await connectMongoTestReplSet();
});

after(async () => {
  await disconnectMongoTestReplSet();
});

beforeEach(async () => {
  fetchedUrls = [];
  await clearMongoCollections();
});

afterEach(() => {
  globalThis.fetch = REAL_FETCH;
  delete process.env.GEO_EXTERNAL_TEST;
  delete process.env.GEO_NOMINATIM_INTERVAL_MS;
});

describe("тариф собственной доставки на заказе", () => {
  it("километраж считается по дорогам, а не по прямой", async () => {
    stubGeoFetch(() => ({ body: osrmRoute(15_200) }));
    const seller = await createSeller();
    const sellerId = String(seller._id);
    const prepared = await prepare(sellerId);

    assert.equal(prepared[sellerId].distanceKm, 15.2);
    assert.equal(prepared[sellerId].distanceSource, "road");
    // 15,2 км по дорогам → 16 полных: 200 + 16 * 30. По прямой было бы 560.
    assert.equal(fees(sellerId, prepared)[sellerId].feeRub, 680);
  });

  it("маршрутизаторы легли — сумма всё равно есть, по прямой с поправкой", async () => {
    stubGeoFetch(() => ({ status: 503, body: {} }));
    const seller = await createSeller();
    const sellerId = String(seller._id);
    const prepared = await prepare(sellerId);

    assert.equal(prepared[sellerId].distanceSource, "estimate");
    // ~11,12 км * 1,3 = 14,46 → 15 полных км: 200 + 15 * 30.
    assert.equal(fees(sellerId, prepared)[sellerId].feeRub, 650);
  });

  it("заказ получает то же расстояние, что и котировка: маршрут из кэша", async () => {
    stubGeoFetch(() => ({ body: osrmRoute(15_200) }));
    const seller = await createSeller();
    const sellerId = String(seller._id);
    await prepare(sellerId);

    // Маршрутизатор «передумал» между корзиной и оформлением.
    stubGeoFetch(() => ({ body: osrmRoute(40_000) }));
    const again = await prepare(sellerId);

    assert.equal(again[sellerId].distanceKm, 15.2);
    assert.equal(
      fetchedUrls.filter((url) => url.includes("/route/")).length,
      1,
      "второй расчёт в маршрутизатор не ходит",
    );
  });

  it("клиентская точка у склада не обнуляет километраж", async () => {
    stubGeoFetch((url) => {
      // Маршрут от склада до самого склада сервер не просит: точка
      // покупателя берётся проверенная, а не присланная.
      assert.ok(
        !url.includes(`${ORIGIN.lon},${ORIGIN.lat};${ORIGIN.lon},${ORIGIN.lat}`),
      );
      return { body: osrmRoute(15_200) };
    });
    const seller = await createSeller();
    const sellerId = String(seller._id);
    const prepared = await prepare(sellerId, { clientGeo: ORIGIN });

    assert.equal(fees(sellerId, prepared)[sellerId].feeRub, 680);
  });

  it("порог бесплатной доставки обнуляет сумму", async () => {
    const seller = await createSeller();
    const sellerId = String(seller._id);
    const prepared = await prepare(sellerId);

    assert.equal(fees(sellerId, prepared, 5000)[sellerId].feeRub, 0);
  });

  it("тариф без цены за километр расстояние не считает вовсе", async () => {
    stubGeoFetch(() => {
      throw new Error("внешний сервис не нужен");
    });
    const seller = await createSeller({
      paid: true,
      baseFeeRub: 300,
      perKmRub: 0,
      freeFromRub: 0,
    });
    const sellerId = String(seller._id);
    const prepared = await prepare(sellerId);

    assert.equal(prepared[sellerId].distanceKm, null);
    assert.equal(fees(sellerId, prepared)[sellerId].feeRub, 300);
    assert.equal(fetchedUrls.length, 0);
  });

  it("у курьеров Gitorg тариф продавца не применяется", async () => {
    const seller = await createSeller();
    const prepared = await prepare(String(seller._id), { carrier: "gitorg_courier" });

    assert.deepEqual(prepared, {}, "там сумму называет покупатель");
  });

  it("продавец без тарифа возит бесплатно", async () => {
    const seller = await createSeller({
      paid: false,
      baseFeeRub: 0,
      perKmRub: 0,
      freeFromRub: 0,
    });
    const sellerId = String(seller._id);
    const prepared = await prepare(sellerId);

    assert.equal(fees(sellerId, prepared)[sellerId].feeRub, 0);
  });

  it("сумма, тариф и источник расстояния ложатся в отправление снимком", async () => {
    stubGeoFetch(() => ({ body: osrmRoute(15_200) }));
    const seller = await createSeller();
    const sellerId = String(seller._id);
    const resolved = fees(sellerId, await prepare(sellerId));

    const [shipment] = buildStoredShipments(
      [{ sellerIdAtOrder: sellerId, status: "pending" }],
      {
        fulfillmentBySellerId: { [sellerId]: "delivery" },
        deliveryCarrierBySellerId: { [sellerId]: "seller" },
        sellerDeliveryBySellerId: resolved,
      },
    );

    assert.equal(shipment.sellerDeliveryFeeRub, 680);
    assert.equal(shipment.sellerDeliveryDistanceKm, 15.2);
    assert.equal(shipment.sellerDeliveryDistanceSource, "road");
    assert.equal(shipment.sellerDeliveryTariffAtOrder.baseFeeRub, 200);
    assert.equal(shipment.sellerDeliveryTariffAtOrder.perKmRub, 30);
  });

  it("самовывозное отправление тариф не получает", async () => {
    const seller = await createSeller();
    const sellerId = String(seller._id);
    const resolved = fees(sellerId, await prepare(sellerId));

    const [shipment] = buildStoredShipments(
      [{ sellerIdAtOrder: sellerId, status: "pending" }],
      {
        fulfillmentBySellerId: { [sellerId]: "pickup" },
        sellerDeliveryBySellerId: resolved,
      },
    );

    assert.equal(shipment.sellerDeliveryFeeRub, 0);
  });

  it("счёт без посчитанного расстояния не выставляется", () => {
    assert.throws(
      () =>
        resolveSellerDeliveryFeesBySeller({
          preparedBySellerId: {
            s1: { tariff: TARIFF, distanceKm: null, distanceSource: null },
          },
          goodsTotalBySellerId: { s1: 1000 },
        }),
      /расстояние доставки/,
    );
  });
});

describe("исходные данные для тарифа", () => {
  it("порог считается без бесплатных единиц акции «N+1»", () => {
    const totals = buildGoodsTotalBySeller([
      {
        sellerIdAtOrder: "s1",
        unitPriceAtOrder: 1000,
        quantity: 3,
        buyNFreeUnitsAtOrder: 1,
      },
    ]);

    assert.equal(
      totals.s1,
      2000,
      "иначе акция сама себе открывала бы бесплатную доставку",
    );
  });
});
