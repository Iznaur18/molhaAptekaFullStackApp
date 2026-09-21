import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";

process.env.JWT_SECRET ||= "test-secret-for-cdek-label";

const { OrderModel, UserModel } = await import("../models/index.js");
const { sealCdekSecret } =
  await import("../services/shipping/cdek/cdekCredentialsCrypto.js");
const { forgetCdekToken } = await import("../services/shipping/cdek/cdekClient.js");
const { getCdekLabelPdf } = await import("../services/shipping/cdek/cdekLabel.js");
const { createCdekIntake, resolveMoscowToday } =
  await import("../services/shipping/cdek/cdekIntake.js");

const realFetch = globalThis.fetch;
const sellerId = "64b000000000000000000001";
const orderId = "650000000000000000000abc";

/**
 * @param {{ deliveryMode?: number; waybill?: Record<string, unknown> | null }} [options]
 */
function mockOrderAndSeller({ deliveryMode = 2, waybill = null } = {}) {
  mock.method(OrderModel, "findById", () => ({
    lean: async () => ({
      _id: orderId,
      items: [],
      shipments: [
        {
          sellerId,
          cdekShipmentAtOrder: { tariffCode: 137, deliveryMode },
          cdekWaybill: waybill,
        },
      ],
    }),
  }));
  const saved = [];
  mock.method(OrderModel, "updateOne", async (filter, update) => {
    saved.push(update.$set["shipments.$.cdekWaybill"]);
    return { modifiedCount: 1 };
  });
  mock.method(UserModel, "findById", () => ({
    select: () => ({
      lean: async () => ({
        userName: "Магазин Иса",
        cdekIntegration: {
          account: "acc",
          secureSealed: sealCdekSecret("sec"),
          environment: "prod",
        },
      }),
    }),
  }));
  return saved;
}

/**
 * @param {(key: string, init: RequestInit) => { status?: number; body: unknown; raw?: Uint8Array }} route
 */
function mockCdek(route) {
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    const href = new URL(String(url));
    if (href.pathname.endsWith("/oauth/token")) {
      return new Response(JSON.stringify({ access_token: "t", expires_in: 3600 }));
    }
    const key = `${init.method ?? "GET"} ${href.host}${href.pathname}`;
    calls.push({ key, body: init.body ? JSON.parse(String(init.body)) : null });
    const answer = route(key, init);
    if (answer.raw) return new Response(answer.raw, { status: 200 });
    return new Response(JSON.stringify(answer.body), { status: answer.status ?? 200 });
  };
  return calls;
}

afterEach(() => {
  globalThis.fetch = realFetch;
  forgetCdekToken({ account: "acc", secure: "sec", environment: "prod" });
  mock.restoreAll();
});

describe("этикетка СДЭК", () => {
  it("пока нет номера СДЭК — объясняем, что рано", async () => {
    mockOrderAndSeller({ waybill: { uuid: "u-1", cdekNumber: null } });
    await assert.rejects(getCdekLabelPdf({ orderId, sellerId }), /присвоит номер/);
  });

  it("заказывает печать, ждёт готовности и отдаёт PDF", async () => {
    mockOrderAndSeller({ waybill: { uuid: "u-1", cdekNumber: "10323896114" } });
    let polls = 0;
    const calls = mockCdek((key) => {
      if (key === "POST api.cdek.ru/v2/print/barcodes") {
        return { body: { entity: { uuid: "p-1" } } };
      }
      if (key === "GET api.cdek.ru/v2/print/barcodes/p-1") {
        polls += 1;
        return polls === 1
          ? { body: { entity: { statuses: [{ code: "PROCESSING" }] } } }
          : {
              body: {
                entity: {
                  url: "https://api.cdek.ru/v2/print/barcodes/p-1.pdf",
                  statuses: [{ code: "READY" }],
                },
              },
            };
      }
      if (key === "GET api.cdek.ru/v2/print/barcodes/p-1.pdf") {
        return { body: null, raw: new TextEncoder().encode("%PDF-1.4") };
      }
      return { status: 404, body: {} };
    });

    const { pdf, fileName } = await getCdekLabelPdf({
      orderId,
      sellerId,
      sleepFn: async () => {},
    });

    assert.equal(pdf.toString("utf8"), "%PDF-1.4");
    assert.equal(fileName, "cdek-10323896114.pdf");
    assert.deepEqual(calls[0].body.orders, [{ order_uuid: "u-1" }]);
  });

  it("ссылку на чужой хост не качаем — токен туда не уходит", async () => {
    mockOrderAndSeller({ waybill: { uuid: "u-1", cdekNumber: "1" } });
    const calls = mockCdek((key) => {
      if (key.startsWith("POST")) return { body: { entity: { uuid: "p-1" } } };
      return { body: { entity: { url: "https://evil.example/label.pdf" } } };
    });

    await assert.rejects(
      getCdekLabelPdf({ orderId, sellerId, sleepFn: async () => {} }),
    );
    assert.ok(calls.every((call) => !call.key.includes("evil.example")));
  });
});

describe("вызов курьера СДЭК", () => {
  const window = { intakeDate: "2026-09-22", timeFrom: "10:00", timeTo: "14:00" };

  it("тариф «склад-склад» — курьер не нужен", async () => {
    mockOrderAndSeller({ deliveryMode: 4, waybill: { uuid: "u-1", cdekNumber: "1" } });
    await assert.rejects(
      createCdekIntake({
        orderId,
        sellerId,
        ...window,
        phone: "+79990001122",
        today: "2026-09-21",
      }),
      /сдаёте в пункт сами/,
    );
  });

  it("окно короче трёх часов — отказ до обращения в СДЭК", async () => {
    mockOrderAndSeller({ waybill: { uuid: "u-1", cdekNumber: "1" } });
    const calls = mockCdek(() => ({ body: {} }));
    await assert.rejects(
      createCdekIntake({
        orderId,
        sellerId,
        ...window,
        timeTo: "12:00",
        phone: "+79990001122",
        today: "2026-09-21",
      }),
      /не меньше 3 часов/,
    );
    assert.equal(calls.length, 0);
  });

  it("создаёт заявку по накладной и сохраняет её", async () => {
    const saved = mockOrderAndSeller({ waybill: { uuid: "u-1", cdekNumber: "1" } });
    const calls = mockCdek((key) => {
      if (key === "POST api.cdek.ru/v2/intakes") {
        return { body: { entity: { uuid: "i-1" } } };
      }
      if (key === "GET api.cdek.ru/v2/intakes/i-1") {
        return {
          body: {
            entity: {
              statuses: [
                {
                  code: "ACCEPTED",
                  name: "Принята",
                  date_time: "2026-09-21T12:00:00+0000",
                },
              ],
            },
          },
        };
      }
      return { status: 404, body: {} };
    });

    const waybill = await createCdekIntake({
      orderId,
      sellerId,
      ...window,
      phone: "+79990001122",
      comment: "Домофон 12",
      today: "2026-09-21",
    });

    const body = calls[0].body;
    assert.equal(body.order_uuid, "u-1");
    assert.equal(body.intake_date, "2026-09-22");
    assert.equal(body.intake_time_from, "10:00");
    assert.equal(body.intake_time_to, "14:00");
    assert.equal(body.comment, "Домофон 12");
    assert.deepEqual(body.sender, {
      name: "Магазин Иса",
      phones: [{ number: "+79990001122" }],
    });
    assert.equal(waybill.intake.uuid, "i-1");
    assert.equal(waybill.intake.status, "Принята");
    assert.equal(saved.at(-1).intake.uuid, "i-1");
  });

  it("повторно курьера не вызываем", async () => {
    mockOrderAndSeller({
      waybill: { uuid: "u-1", cdekNumber: "1", intake: { uuid: "i-1" } },
    });
    await assert.rejects(
      createCdekIntake({
        orderId,
        sellerId,
        ...window,
        phone: "+79990001122",
        today: "2026-09-21",
      }),
      /уже вызван/,
    );
  });

  it("«сегодня» считаем по Москве", () => {
    assert.equal(resolveMoscowToday(new Date("2026-09-21T22:30:00Z")), "2026-09-22");
    assert.equal(resolveMoscowToday(new Date("2026-09-21T20:30:00Z")), "2026-09-21");
  });
});
