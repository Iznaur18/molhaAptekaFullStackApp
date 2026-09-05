import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { UserModel } = await import("../models/index.js");
const {
  buildDeliveryOriginBySeller,
  buildGoodsTotalBySeller,
  resolveSellerDeliveryFeesBySeller,
} = await import("../services/order/sellerDeliveryFee.js");
const { buildStoredShipments } = await import("../services/order/orderShipments.js");

/** Грозный → точка примерно в 11 км севернее. */
const ORIGIN = { lat: 43.3, lon: 45.7 };
const BUYER_GEO = { lat: 43.4, lon: 45.7 };

const TARIFF = { paid: true, baseFeeRub: 200, perKmRub: 30, freeFromRub: 5000 };

/** @param {Record<string, unknown>} [tariff] */
const createSeller = (tariff = TARIFF) =>
  UserModel.create({
    email: `tariff-${Math.random().toString(36).slice(2)}@example.com`,
    passwordHash: "x".repeat(20),
    userName: `tariff${Math.random().toString(36).slice(2, 9)}`,
    sellerFulfillmentDefaults: {
      pickupLocations: [
        { id: "profile-1", label: "", address: "г Грозный, ул Мира, 1", ...ORIGIN, isDefault: true },
      ],
      pickupEnabled: true,
      deliveryCarrier: "seller",
      regionCode: "RU-CE",
      deliveryTariff: tariff,
    },
  });

/**
 * @param {string} sellerId
 * @param {{ goods?: number; geo?: unknown; carrier?: string }} [options]
 */
const resolveFees = (sellerId, options = {}) =>
  resolveSellerDeliveryFeesBySeller({
    fulfillmentBySellerId: { [sellerId]: "delivery" },
    deliveryCarrierBySellerId: { [sellerId]: options.carrier ?? "seller" },
    goodsTotalBySellerId: { [sellerId]: options.goods ?? 1000 },
    originBySellerId: { [sellerId]: ORIGIN },
    deliveryAddressGeo: options.geo === undefined ? BUYER_GEO : options.geo,
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

describe("тариф собственной доставки на заказе", () => {
  it("вызов плюс километраж", async () => {
    const seller = await createSeller();
    const fees = await resolveFees(String(seller._id));

    // ~11.1 км → 12 полных км: 200 + 12 * 30
    assert.equal(fees[String(seller._id)].feeRub, 560);
    assert.ok(fees[String(seller._id)].distanceKm > 11);
  });

  it("порог бесплатной доставки обнуляет сумму", async () => {
    const seller = await createSeller();
    const fees = await resolveFees(String(seller._id), { goods: 5000 });

    assert.equal(fees[String(seller._id)].feeRub, 0);
  });

  it("без координат покупателя километраж не начисляется", async () => {
    const seller = await createSeller();
    const fees = await resolveFees(String(seller._id), { geo: null });

    assert.equal(
      fees[String(seller._id)].feeRub,
      200,
      "остаётся только цена за вызов — счёт по догадке выставлять нельзя",
    );
  });

  it("у курьеров Gitorg тариф продавца не применяется", async () => {
    const seller = await createSeller();
    const fees = await resolveFees(String(seller._id), {
      carrier: "gitorg_courier",
    });

    assert.deepEqual(fees, {}, "там сумму называет покупатель");
  });

  it("продавец без тарифа возит бесплатно", async () => {
    const seller = await createSeller({ paid: false, baseFeeRub: 0, perKmRub: 0, freeFromRub: 0 });
    const fees = await resolveFees(String(seller._id));

    assert.equal(fees[String(seller._id)].feeRub, 0);
  });

  it("сумма и тариф ложатся в отправление снимком", async () => {
    const seller = await createSeller();
    const sellerId = String(seller._id);
    const fees = await resolveFees(sellerId);

    const [shipment] = buildStoredShipments(
      [{ sellerIdAtOrder: sellerId, status: "pending" }],
      {
        fulfillmentBySellerId: { [sellerId]: "delivery" },
        deliveryCarrierBySellerId: { [sellerId]: "seller" },
        sellerDeliveryBySellerId: fees,
      },
    );

    assert.equal(shipment.sellerDeliveryFeeRub, 560);
    assert.equal(shipment.sellerDeliveryTariffAtOrder.baseFeeRub, 200);
    assert.equal(shipment.sellerDeliveryTariffAtOrder.perKmRub, 30);
    assert.ok(shipment.sellerDeliveryDistanceKm > 11);
  });

  it("самовывозное отправление тариф не получает", async () => {
    const seller = await createSeller();
    const sellerId = String(seller._id);
    const fees = await resolveFees(sellerId);

    const [shipment] = buildStoredShipments(
      [{ sellerIdAtOrder: sellerId, status: "pending" }],
      {
        fulfillmentBySellerId: { [sellerId]: "pickup" },
        sellerDeliveryBySellerId: fees,
      },
    );

    assert.equal(shipment.sellerDeliveryFeeRub, 0);
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

  it("точка отправления берётся с товара продавца", () => {
    const origins = buildDeliveryOriginBySeller({
      p1: { sellerId: "s1", productPickupLat: 43.3, productPickupLon: 45.7 },
      p2: { sellerId: "s2", productPickupLat: null, productPickupLon: null },
    });

    assert.deepEqual(origins.s1, { lat: 43.3, lon: 45.7 });
    assert.equal(origins.s2, null);
  });
});
