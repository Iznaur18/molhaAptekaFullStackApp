import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";

process.env.JWT_SECRET ||= "test-secret-for-cdek-quote";

const { ProductModel, UserModel } = await import("../models/index.js");
const { sealCdekSecret } =
  await import("../services/shipping/cdek/cdekCredentialsCrypto.js");
const { forgetCdekToken } = await import("../services/shipping/cdek/cdekClient.js");
const { quoteCdekShipment } =
  await import("../services/shipping/cdek/quoteCdekShipment.js");

const realFetch = globalThis.fetch;

/**
 * Товары одного или разных продавцов — как их вернула бы база.
 *
 * @param {{ sellers: string[]; pickupAddress?: string }} params
 */
function mockProducts({ sellers, pickupAddress = "Грозный, ул. Мира, 1" }) {
  mock.method(ProductModel, "find", () => ({
    select: () => ({
      lean: async () =>
        sellers.map((sellerId, index) => ({
          _id: `product-${index}`,
          productSeller: sellerId,
          productPickupAddress: pickupAddress,
          productRegionCode: "RU-CE",
        })),
    }),
  }));
}

/**
 * @param {{ connected: boolean }} params
 */
function mockSeller({ connected, enabled }) {
  mock.method(UserModel, "findById", () => ({
    select: () => ({
      lean: async () =>
        connected
          ? {
              cdekIntegration: {
                account: "acc",
                secureSealed: sealCdekSecret("sec"),
                environment: "test",
                ...(enabled === undefined ? {} : { enabled }),
              },
            }
          : { cdekIntegration: null },
    }),
  }));
}

function mockCdekTariffs(tariffCodes) {
  globalThis.fetch = async (url) => {
    const href = String(url);
    if (href.endsWith("/oauth/token")) {
      return new Response(JSON.stringify({ access_token: "t", expires_in: 3600 }), {
        status: 200,
      });
    }
    return new Response(JSON.stringify({ tariff_codes: tariffCodes }), { status: 200 });
  };
}

afterEach(() => {
  mock.restoreAll();
  globalThis.fetch = realFetch;
  forgetCdekToken({ account: "acc", secure: "sec", environment: "test" });
});

describe("расчёт СДЭК для корзины", () => {
  it("возвращает варианты и самый дешёвый отдельно", async () => {
    mockProducts({ sellers: ["seller-1", "seller-1"] });
    mockSeller({ connected: true });
    mockCdekTariffs([
      {
        tariff_code: 136,
        tariff_name: "Посылка дверь-склад",
        delivery_mode: 2,
        delivery_sum: 520,
        period_min: 2,
        period_max: 4,
      },
      {
        tariff_code: 137,
        tariff_name: "Посылка склад-склад",
        delivery_mode: 4,
        delivery_sum: 410,
        period_min: 3,
        period_max: 5,
      },
    ]);

    const result = await quoteCdekShipment({
      productIds: ["a", "b"],
      toCityCode: 270,
    });

    assert.equal(result.available, true);
    assert.equal(result.options.length, 2);
    assert.equal(result.best.tariffCode, 137);
    assert.equal(result.best.deliverySumRub, 410);
  });

  it("товары двух продавцов в один расчёт не берём", async () => {
    mockProducts({ sellers: ["seller-1", "seller-2"] });
    await assert.rejects(
      () => quoteCdekShipment({ productIds: ["a", "b"], toCityCode: 270 }),
      /разных продавцов/,
    );
  });

  it("продавец без ключей — просто нет варианта СДЭК, а не ошибка", async () => {
    mockProducts({ sellers: ["seller-1"] });
    mockSeller({ connected: false });

    const result = await quoteCdekShipment({ productIds: ["a"], toCityCode: 270 });
    assert.equal(result.available, false);
    assert.equal(result.reason, "not_connected");
  });

  it("без адреса отправления в СДЭК не ходим", async () => {
    mockProducts({ sellers: ["seller-1"], pickupAddress: "" });
    mockSeller({ connected: true });
    let called = false;
    globalThis.fetch = async () => {
      called = true;
      return new Response("{}", { status: 200 });
    };

    const result = await quoteCdekShipment({ productIds: ["a"], toCityCode: 270 });
    assert.equal(result.available, false);
    assert.equal(result.reason, "no_pickup_address");
    assert.equal(called, false);
  });

  it("если подходящих тарифов нет, честно говорим об этом", async () => {
    mockProducts({ sellers: ["seller-1"] });
    mockSeller({ connected: true });
    // Только дверь-дверь: для выдачи в пункте не годится.
    mockCdekTariffs([
      { tariff_code: 139, delivery_mode: 1, delivery_sum: 300, tariff_name: "дверь" },
    ]);

    const result = await quoteCdekShipment({ productIds: ["a"], toCityCode: 270 });
    assert.equal(result.available, false);
    assert.equal(result.reason, "no_tariffs");
  });

  it("продавец выключил тумблер — СДЭК покупателю не предлагаем", async () => {
    mockProducts({ sellers: ["seller-1"] });
    mockSeller({ connected: true, enabled: false });
    let called = false;
    globalThis.fetch = async () => {
      called = true;
      return new Response("{}", { status: 200 });
    };

    const result = await quoteCdekShipment({ productIds: ["a"], toCityCode: 270 });
    assert.equal(result.available, false);
    assert.equal(result.reason, "disabled");
    assert.equal(called, false, "в СДЭК за выключенного продавца не ходим");
  });
});
