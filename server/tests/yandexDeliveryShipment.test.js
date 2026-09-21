import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";

process.env.JWT_SECRET ||= "test-secret-for-yandex-shipment";

const { ProductModel, UserModel } = await import("../models/index.js");
const { sealYandexDeliveryToken } =
  await import("../services/shipping/yandex/yandexDeliveryCredentialsCrypto.js");
const { readYandexPricing, buildYandexPackage } =
  await import("../services/shipping/yandex/yandexDeliveryPricing.js");
const { quoteYandexDeliveryShipment, resolveYandexDeliveryOrderShipment } =
  await import("../services/shipping/yandex/yandexDeliveryShipment.js");
const { setSellerYandexDropoffStation } =
  await import("../services/shipping/yandex/yandexDeliverySellerCredentials.js");

const realFetch = globalThis.fetch;
const SELLER = "64b000000000000000000001";
const PRODUCT = "64c000000000000000000001";

const PHONE = {
  id: "0198602de4a6749aba12e151bdf4caaa",
  name: "Пункт выдачи заказов Яндекс Маркета",
  type: "pickup_point",
  position: { latitude: 43.31, longitude: 45.69 },
  address: { geoId: 1106, locality: "Грозный", full_address: "Грозный, пр. Путина, 1" },
  payment_methods: ["already_paid", "card_on_receipt"],
  available_for_dropoff: true,
};

/**
 * @param {{ integration?: Record<string, unknown> | null }} [options]
 */
function mockSellerAndProduct({ integration } = {}) {
  mock.method(UserModel, "findById", () => ({
    select: () => ({
      lean: async () => ({
        yandexDeliveryIntegration:
          integration === undefined
            ? {
                tokenSealed: sealYandexDeliveryToken("token-1234"),
                enabled: true,
                environment: "prod",
                dropoffStation: { id: "drop-1", name: "ПВЗ", address: "Грозный" },
              }
            : integration,
      }),
    }),
  }));
  mock.method(ProductModel, "find", () => ({
    select: () => ({
      lean: async () => [
        {
          _id: PRODUCT,
          productSeller: SELLER,
          productPrice: 90000,
          productWeightG: 350,
          productLengthCm: 20,
          productWidthCm: 15,
          productHeightCm: 8,
        },
      ],
    }),
  }));
}

/**
 * @param {{ points?: unknown[]; pricing?: Record<string, unknown> }} answers
 */
function mockYandex({ points = [PHONE], pricing } = {}) {
  const bodies = {};
  globalThis.fetch = async (url, init = {}) => {
    const path = new URL(String(url)).pathname.replace(/^.*\/platform/, "");
    bodies[path] = JSON.parse(String(init.body ?? "null"));
    if (path === "/pickup-points/list") {
      return new Response(JSON.stringify({ points }), { status: 200 });
    }
    if (path === "/pricing-calculator") {
      return new Response(
        JSON.stringify(
          pricing ?? {
            pricing_total: "3146.38 RUB",
            pricing_commission_on_delivery_payment_amount: "2415.6 RUB",
            delivery_days: 3,
          },
        ),
        { status: 200 },
      );
    }
    return new Response("{}", { status: 404 });
  };
  return bodies;
}

afterEach(() => {
  globalThis.fetch = realFetch;
  mock.restoreAll();
});

describe("цена Яндекс Доставки", () => {
  it("покупателю — только доставка: комиссию за приём оплаты платит продавец", () => {
    const pricing = readYandexPricing({
      pricing_total: "3146.38 RUB",
      pricing_commission_on_delivery_payment_amount: "2415.6 RUB",
      delivery_days: 2,
    });
    assert.equal(pricing.deliverySumRub, 731);
    assert.equal(pricing.paymentCommissionRub, 2415.6);
    assert.equal(pricing.totalSellerCostRub, 3146.38);
    assert.equal(pricing.deliveryDays, 2);
  });

  it("без комиссии (предоплата) — вся сумма и есть доставка", () => {
    assert.equal(
      readYandexPricing({ pricing_total: "181.78 RUB" }).deliverySumRub,
      182,
    );
    assert.equal(readYandexPricing({}), null);
  });

  it("посылка учитывает количество: вес и высота на каждую штуку", () => {
    const { pack, itemsTotalRub } = buildYandexPackage([
      {
        product: {
          productWeightG: 350,
          productLengthCm: 20,
          productWidthCm: 15,
          productHeightCm: 8,
        },
        quantity: 2,
        unitPriceRub: 1000,
      },
    ]);
    assert.equal(pack.weightG, 700);
    assert.equal(pack.heightCm, 16);
    assert.equal(itemsTotalRub, 2000);
  });
});

describe("расчёт для корзины", () => {
  const items = [{ productId: PRODUCT, quantity: 1 }];

  it("продавец не подключил Яндекс — варианта нет, без ошибки", async () => {
    mockSellerAndProduct({ integration: null });
    const result = await quoteYandexDeliveryShipment({
      items,
      pickupPointId: PHONE.id,
    });
    assert.deepEqual(result, { available: false, reason: "not_connected" });
  });

  it("токен есть, пункт сдачи не выбран — варианта нет", async () => {
    mockSellerAndProduct({
      integration: {
        tokenSealed: sealYandexDeliveryToken("token-1234"),
        enabled: true,
      },
    });
    const result = await quoteYandexDeliveryShipment({
      items,
      pickupPointId: PHONE.id,
    });
    assert.deepEqual(result, { available: false, reason: "no_dropoff" });
  });

  it("считает из пункта сдачи продавца с оплатой картой и ценой в копейках", async () => {
    mockSellerAndProduct();
    const bodies = mockYandex();

    const result = await quoteYandexDeliveryShipment({
      items,
      pickupPointId: PHONE.id,
    });

    assert.equal(result.available, true);
    assert.equal(result.deliverySumRub, 731);
    assert.equal(result.deliveryDays, 3);
    const body = bodies["/pricing-calculator"];
    assert.deepEqual(body.source, { platform_station_id: "drop-1" });
    assert.deepEqual(body.destination, { platform_station_id: PHONE.id });
    assert.equal(body.tariff, "self_pickup");
    assert.equal(body.payment_method, "card_on_receipt");
    assert.equal(body.client_price, 9_000_000);
    assert.equal(body.total_weight, 350);
  });
});

describe("выбор Яндекса при оформлении", () => {
  const selection = {
    pickupPointId: PHONE.id,
    recipient: { name: "Иван Петров", phone: "+79990001122" },
  };

  it("снимок: цена пересчитана сервером, адрес заказа — пункт выдачи", async () => {
    mockSellerAndProduct();
    mockYandex();

    const result = await resolveYandexDeliveryOrderShipment({
      sellerId: SELLER,
      items: [{ productId: PRODUCT, quantity: 1 }],
      selection,
    });

    assert.equal(result.snapshot.deliverySumRub, 731);
    assert.equal(result.snapshot.paymentCommissionRub, 2415.6);
    assert.equal(result.snapshot.dropoffStationId, "drop-1");
    assert.equal(result.snapshot.pickupPoint.id, PHONE.id);
    assert.equal(result.addressForOrder.displayAddress, "Грозный, пр. Путина, 1");
    assert.deepEqual(result.addressForOrder.geo, { lat: 43.31, lon: 45.69 });
  });

  it("пункт без оплаты картой — заказ не оформить", async () => {
    mockSellerAndProduct();
    mockYandex({ points: [{ ...PHONE, payment_methods: ["already_paid"] }] });

    await assert.rejects(
      resolveYandexDeliveryOrderShipment({
        sellerId: SELLER,
        items: [{ productId: PRODUCT, quantity: 1 }],
        selection,
      }),
      /не принимает оплату картой/,
    );
  });
});

describe("пункт сдачи продавца", () => {
  it("пункт, который не принимает отправления, не сохраняем", async () => {
    mockSellerAndProduct();
    mockYandex({ points: [{ ...PHONE, available_for_dropoff: false }] });
    const update = mock.method(UserModel, "findByIdAndUpdate", () => ({
      lean: async () => null,
    }));

    await assert.rejects(
      setSellerYandexDropoffStation({ sellerId: SELLER, stationId: PHONE.id }),
      /не принимает отправления/,
    );
    assert.equal(update.mock.callCount(), 0);
  });
});
