import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";

process.env.JWT_SECRET ||= "test-secret-for-cdek-order";

const { ProductModel, UserModel } = await import("../models/index.js");
const { sealCdekSecret } =
  await import("../services/shipping/cdek/cdekCredentialsCrypto.js");
const { forgetCdekToken } = await import("../services/shipping/cdek/cdekClient.js");
const { resolveCdekOrderShipment } =
  await import("../services/shipping/cdek/resolveCdekOrderShipment.js");
const { buildStoredShipments } = await import("../services/order/orderShipments.js");

const realFetch = globalThis.fetch;
const selection = { tariffCode: 136, pickupPointCode: "MSK180", toCityCode: 44 };

function mockSellerAndProducts() {
  mock.method(UserModel, "findById", () => ({
    select: () => ({
      lean: async () => ({
        cdekIntegration: {
          account: "acc",
          secureSealed: sealCdekSecret("sec"),
          environment: "prod",
        },
      }),
    }),
  }));
  mock.method(ProductModel, "find", () => ({
    select: () => ({
      lean: async () => [
        {
          productPickupAddress: "Грозный, ул. Мира, 1",
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
 * @param {{ tariffs: unknown[]; points: unknown[] }} replies
 */
function mockCdek({ tariffs, points }) {
  /** @type {unknown[]} */
  const tariffBodies = [];
  globalThis.fetch = async (url, init = {}) => {
    const href = String(url);
    if (href.endsWith("/oauth/token")) {
      return new Response(JSON.stringify({ access_token: "t", expires_in: 3600 }), {
        status: 200,
      });
    }
    if (href.includes("/calculator/tarifflist")) {
      tariffBodies.push(JSON.parse(String(init.body)));
      return new Response(JSON.stringify({ tariff_codes: tariffs }), { status: 200 });
    }
    if (href.includes("/deliverypoints")) {
      return new Response(JSON.stringify(points), { status: 200 });
    }
    throw new Error(`неожиданный запрос ${href}`);
  };
  return tariffBodies;
}

const POINT = {
  code: "MSK180",
  name: "MSK180, Москва, ул. Верхняя Красносельская",
  work_time: "Пн-Пт 10:00-21:00",
  location: {
    city_code: 44,
    city: "Москва",
    address_full: "Москва, ул. Верхняя Красносельская, 17А",
    latitude: 55.78,
    longitude: 37.66,
  },
};

afterEach(() => {
  mock.restoreAll();
  globalThis.fetch = realFetch;
  forgetCdekToken({ account: "acc", secure: "sec", environment: "prod" });
});

describe("СДЭК при оформлении заказа", () => {
  it("цену берёт из своего пересчёта, адрес заказа — из пункта", async () => {
    mockSellerAndProducts();
    const bodies = mockCdek({
      tariffs: [
        {
          tariff_code: 136,
          tariff_name: "Посылка склад-склад",
          delivery_mode: 4,
          delivery_sum: 390,
          period_min: 3,
          period_max: 4,
        },
      ],
      points: [POINT],
    });

    const result = await resolveCdekOrderShipment({
      sellerId: "seller-1",
      productIds: ["p1"],
      selection,
    });

    assert.equal(result.snapshot.deliverySumRub, 390);
    assert.equal(result.snapshot.exact, true);
    assert.equal(result.snapshot.pickupPoint.code, "MSK180");
    assert.equal(
      result.addressForOrder.displayAddress,
      "Москва, ул. Верхняя Красносельская, 17А",
    );
    assert.deepEqual(result.addressForOrder.geo, { lat: 55.78, lon: 37.66 });
    // Вес реального товара, а не средней коробки.
    assert.equal(bodies[0].packages[0].weight, 350);
  });

  it("тариф, которого больше нет, — понятная ошибка, а не заказ по старой цене", async () => {
    mockSellerAndProducts();
    mockCdek({
      tariffs: [
        {
          tariff_code: 138,
          tariff_name: "Посылка дверь-склад",
          delivery_mode: 2,
          delivery_sum: 725,
        },
      ],
      points: [POINT],
    });

    await assert.rejects(
      () =>
        resolveCdekOrderShipment({
          sellerId: "seller-1",
          productIds: ["p1"],
          selection,
        }),
      /тариф СДЭК больше недоступен/,
    );
  });

  it("закрытый пункт выдачи — ошибка до создания заказа", async () => {
    mockSellerAndProducts();
    mockCdek({
      tariffs: [
        {
          tariff_code: 136,
          tariff_name: "Посылка склад-склад",
          delivery_mode: 4,
          delivery_sum: 390,
        },
      ],
      points: [],
    });

    await assert.rejects(
      () =>
        resolveCdekOrderShipment({
          sellerId: "seller-1",
          productIds: ["p1"],
          selection,
        }),
      /Пункт выдачи СДЭК не найден/,
    );
  });
});

describe("снимок СДЭК в отправлении", () => {
  it("кладётся в отправление продавца и не трогает сумму доставки продавцом", () => {
    const snapshot = { tariffCode: 136, deliverySumRub: 390 };
    const [shipment] = buildStoredShipments(
      [{ productId: { productSeller: "seller-1" }, sellerIdAtOrder: "seller-1" }],
      {
        fulfillmentBySellerId: { "seller-1": "delivery" },
        cdekShipmentBySellerId: { "seller-1": snapshot },
      },
    );

    assert.ok(shipment, "отправление продавца должно быть");
    assert.deepEqual(shipment.cdekShipmentAtOrder, snapshot);
    assert.equal(shipment.sellerDeliveryFeeRub, 0);
  });
});
