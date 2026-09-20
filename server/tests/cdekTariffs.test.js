import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

process.env.JWT_SECRET ||= "test-secret-for-cdek-tariffs";

const { quoteCdekPickupTariffs, buildCdekLocation, buildCdekPackages } =
  await import("../services/shipping/cdek/cdekTariffs.js");
const { listCdekDeliveryPoints, resolveCdekCityCode } =
  await import("../services/shipping/cdek/cdekDeliveryPoints.js");
const { forgetCdekToken } = await import("../services/shipping/cdek/cdekClient.js");

const credentials = { account: "acc", secure: "sec", environment: "test" };
const realFetch = globalThis.fetch;

/**
 * @param {(url: string, init: RequestInit) => unknown} handler
 */
function mockCdek(handler) {
  /** @type {{ url: string; body: unknown }[]} */
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    const href = String(url);
    if (href.endsWith("/oauth/token")) {
      return new Response(JSON.stringify({ access_token: "t", expires_in: 3600 }), {
        status: 200,
      });
    }
    const body = init.body ? JSON.parse(String(init.body)) : null;
    calls.push({ url: href, body });
    return new Response(JSON.stringify(handler(href, init)), { status: 200 });
  };
  return calls;
}

afterEach(() => {
  globalThis.fetch = realFetch;
  forgetCdekToken(credentials);
});

describe("расчёт тарифов СДЭК", () => {
  it("оставляет только выдачу в пункте и сортирует по цене", async () => {
    mockCdek(() => ({
      tariff_codes: [
        {
          tariff_code: 137,
          tariff_name: "Посылка склад-склад",
          delivery_mode: 4,
          delivery_sum: 480.2,
          period_min: 2,
          period_max: 4,
        },
        {
          tariff_code: 139,
          tariff_name: "Посылка дверь-дверь",
          delivery_mode: 1,
          delivery_sum: 300,
          period_min: 2,
          period_max: 3,
        },
        {
          tariff_code: 136,
          tariff_name: "Посылка дверь-склад",
          delivery_mode: 2,
          delivery_sum: 390,
          period_min: 1,
          period_max: 3,
        },
      ],
    }));

    const options = await quoteCdekPickupTariffs(credentials, {
      from: { code: 44 },
      to: { code: 270 },
      itemCount: 2,
    });

    assert.deepEqual(
      options.map((option) => option.tariffCode),
      [136, 137],
      "дверь-дверь в выдачу в пункте не годится",
    );
    assert.equal(options[0].deliverySumRub, 390);
    // Копейки округляем вверх: показать меньше, чем спишет СДЭК, нельзя.
    assert.equal(options[1].deliverySumRub, 481);
  });

  it("вес растёт с числом позиций", () => {
    assert.equal(buildCdekPackages(1)[0].weight, 1000);
    assert.equal(buildCdekPackages(3)[0].weight, 3000);
    assert.equal(buildCdekPackages(0)[0].weight, 1000);
  });

  it("точку задаём кодом, индексом или адресом — в таком порядке", () => {
    assert.deepEqual(buildCdekLocation({ code: 44, postalCode: "101000" }), {
      code: 44,
    });
    assert.deepEqual(buildCdekLocation({ postalCode: "101000" }), {
      postal_code: "101000",
    });
    assert.deepEqual(buildCdekLocation({ address: "Грозный, Мира 1" }), {
      address: "Грозный, Мира 1",
    });
    assert.equal(buildCdekLocation({}), null);
  });

  it("без обеих точек в СДЭК не ходим", async () => {
    const calls = mockCdek(() => ({ tariff_codes: [] }));
    const options = await quoteCdekPickupTariffs(credentials, {
      from: {},
      to: { code: 270 },
      itemCount: 1,
    });
    assert.deepEqual(options, []);
    assert.equal(calls.length, 0);
  });
});

describe("пункты выдачи СДЭК", () => {
  it("читает адрес, координаты и режим работы", async () => {
    mockCdek(() => [
      {
        code: "MSK123",
        name: "Пункт выдачи на Мира",
        work_time: "Пн-Пт 09:00-20:00",
        have_cashless: true,
        location: {
          city_code: 44,
          city: "Москва",
          address_full: "г. Москва, ул. Мира, 1",
          latitude: 55.75,
          longitude: 37.61,
        },
      },
      { name: "без кода — пропускаем" },
    ]);

    const points = await listCdekDeliveryPoints(credentials, { cityCode: 44 });
    assert.equal(points.length, 1);
    assert.deepEqual(points[0], {
      code: "MSK123",
      name: "Пункт выдачи на Мира",
      address: "г. Москва, ул. Мира, 1",
      cityCode: 44,
      city: "Москва",
      lat: 55.75,
      lon: 37.61,
      workTime: "Пн-Пт 09:00-20:00",
      hasCashless: true,
    });
  });

  it("код города ищется по названию, пустой запрос не отправляется", async () => {
    const calls = mockCdek(() => [{ code: 270, city: "Грозный" }]);
    assert.equal(await resolveCdekCityCode(credentials, {}), null);
    assert.equal(calls.length, 0);

    const code = await resolveCdekCityCode(credentials, { city: "Грозный" });
    assert.equal(code, 270);
    assert.match(calls.at(-1).url, /\/location\/cities\?/);
  });
});
