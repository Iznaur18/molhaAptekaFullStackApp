import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";

const client = await import("../services/shipping/lobo/loboClient.js");

const REAL_FETCH = globalThis.fetch;

/** Ключи подставляем свои: настоящие в тестах не нужны и не должны быть. */
const setKeys = () => {
  process.env.LOBO_API_KEY = "dms_test_key";
  process.env.LOBO_API_LOGIN = "tester";
  process.env.LOBO_API_PASSWORD = "secret";
  process.env.LOBO_API_BASE_URL = "https://lobo.example/api/v1/external";
};

const clearKeys = () => {
  delete process.env.LOBO_API_KEY;
  delete process.env.LOBO_API_LOGIN;
  delete process.env.LOBO_API_PASSWORD;
  delete process.env.LOBO_API_BASE_URL;
};

/** @type {Array<{ url: string; init: any }>} */
let calls = [];

/** @param {{ status?: number; body?: unknown }} response */
const stubFetch = ({ status = 200, body = {} }) => {
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    return new Response(body == null ? "" : JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  };
};

describe("клиент ЛОБО", () => {
  beforeEach(() => {
    calls = [];
    setKeys();
  });

  afterEach(() => {
    globalThis.fetch = REAL_FETCH;
    clearKeys();
  });

  it("без ключей за сеть не ходит", async () => {
    clearKeys();
    let touched = false;
    globalThis.fetch = async () => {
      touched = true;
      return new Response("{}", { status: 200 });
    };

    await assert.rejects(
      () =>
        client.estimateLoboDelivery({
          pickupLat: 43.3,
          pickupLon: 45.7,
          deliveryLat: 43.4,
          deliveryLon: 45.8,
        }),
      /не настроена/i,
    );
    assert.equal(touched, false, "иначе шлём запрос без авторизации");
  });

  it("шлёт оба заголовка авторизации", async () => {
    stubFetch({ body: { cost: 300, final_cost: 350 } });

    await client.estimateLoboDelivery({
      pickupLat: 43.3,
      pickupLon: 45.7,
      deliveryLat: 43.4,
      deliveryLon: 45.8,
    });

    const headers = calls[0].init.headers;
    assert.equal(headers["X-API-Key"], "dms_test_key");
    assert.equal(
      headers.Authorization,
      "Basic " + Buffer.from("tester:secret").toString("base64"),
    );
  });

  it("расчёт берёт итог из total и отдаёт токен цены", async () => {
    stubFetch({
      body: {
        quote_token: "quote-abc",
        quote_valid_for_seconds: 300,
        tariff: "car",
        city_id: 1,
        city_name: "Грозный",
        is_suburban: false,
        distance_km: 2.6,
        duration_min: 10.3,
        subzone_fee: 0,
        total: 260,
      },
    });

    const result = await client.estimateLoboDelivery({
      pickupLat: 43.3,
      pickupLon: 45.7,
      deliveryLat: 43.4,
      deliveryLon: 45.8,
    });

    const body = JSON.parse(calls[0].init.body);
    assert.equal(body.tariff, "car", "без тарифа Wayset возьмёт свой по умолчанию");
    assert.equal(result.finalCost, 260);
    assert.equal(result.quoteToken, "quote-abc");
    assert.equal(result.cityName, "Грозный");
    assert.equal(result.distanceKm, 2.6);
  });

  it("заказ уходит неоплаченным, наличными курьеру и с токеном цены", async () => {
    stubFetch({ body: { id: 77, external_id: "order-1", status: "new", total: 260 } });

    const order = await client.createLoboOrder({
      externalId: "order-1",
      clientName: "Продавец",
      clientPhone: "+79000000000",
      pickupAddress: "Грозный, склад",
      pickupLat: 43.3,
      pickupLon: 45.7,
      deliveryAddress: "Грозный, дом",
      deliveryLat: 43.4,
      deliveryLon: 45.8,
      quoteToken: "quote-abc",
    });

    const body = JSON.parse(calls[0].init.body);
    assert.equal(body.is_paid, false, "иначе служба решит, что деньги уже собраны");
    assert.equal(body.payment_method, "cash", "другой способ Wayset отклонит с 400");
    assert.equal(body.tariff, "car");
    assert.equal(body.quote_token, "quote-abc");
    assert.equal(body.external_id, "order-1");
    assert.equal("cost" in body, false, "цену назначает служба, а не мы");
    assert.equal(order.id, "77");
    assert.equal(order.total, 260);
  });

  it("статус читается по id заказа в Wayset", async () => {
    stubFetch({
      body: { id: 77, external_id: "order-1:seller-1", status: "assigned" },
    });

    const order = await client.getLoboOrder("77");

    assert.match(calls[0].url, /\/orders\/77$/);
    assert.equal(order.status, "assigned");
    assert.equal(order.externalId, "order-1:seller-1");
  });

  it("потерянный id находится по нашему номеру в списке заказов", async () => {
    stubFetch({
      body: [
        { id: 76, external_id: "order-0:seller-1", status: "done" },
        { id: 77, external_id: "order-1:seller-1", status: "new" },
      ],
    });

    const order = await client.findLoboOrderByExternalId("order-1:seller-1");

    assert.match(calls[0].url, /\/orders$/);
    assert.equal(order?.id, "77");
  });

  it("перебор частоты не выглядит виной пользователя", async () => {
    stubFetch({ status: 429, body: { detail: "rate limit" } });

    await assert.rejects(
      () => client.getLoboOrder("77"),
      (error) => error.statusCode === 503 && /не отвечает/i.test(error.message),
    );
  });

  it("неверные ключи читаются как «не настроено»", async () => {
    stubFetch({ status: 401, body: { detail: "bad key" } });

    await assert.rejects(
      () => client.getLoboOrder("77"),
      (error) => error.statusCode === 503 && /не настроена/i.test(error.message),
    );
  });

  it("отмена идёт по id заказа в Wayset", async () => {
    stubFetch({ body: { id: 77, external_id: "order-1", status: "cancelled" } });

    const order = await client.cancelLoboOrder("77");

    assert.match(calls[0].url, /\/orders\/77\/cancel$/);
    assert.equal(calls[0].init.method, "POST");
    assert.equal(order.status, "cancelled");
  });

  it("ссылка отслеживания для покупателя", async () => {
    stubFetch({ body: { code: "4821", url: "https://wayset.ru/t/abc" } });

    const tracking = await client.getLoboTracking("77");

    assert.match(calls[0].url, /\/orders\/77\/track$/);
    assert.equal(tracking.url, "https://wayset.ru/t/abc");
  });
});
