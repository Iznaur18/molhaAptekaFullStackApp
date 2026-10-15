import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import {
  cdekAvailabilityDataSchema,
  cdekDeliveryPointsDataSchema,
  cdekOrderSelectionSchema,
  cdekQuoteDataSchema,
} from "@molha/api-contract";
import { buildCdekOrderSelection } from "@izibuy/shared-lib";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

const tariff = {
  tariffCode: 136,
  tariffName: "Посылка склад-склад",
  deliveryMode: 4,
  deliverySumRub: 320,
  periodMinDays: 2,
  periodMaxDays: 4,
};
const point = {
  code: "MSK123",
  name: "На Тверской",
  address: "Москва, ул. Тверская, 1",
  cityCode: 44,
  city: "Москва",
  lat: 55.75,
  lon: 37.61,
  workTime: "Пн-Вс 10:00-20:00",
  hasCashless: true,
};

test("ответы СДЭК читаются схемами контракта", () => {
  assert.equal(cdekAvailabilityDataSchema.parse({ available: true }).available, true);

  const points = cdekDeliveryPointsDataSchema.parse({ points: [point], cityCode: 44 });
  assert.equal(points.points[0].address, point.address);
  // Город не распознан — сервер отдаёт пустой список и null.
  assert.deepEqual(cdekDeliveryPointsDataSchema.parse({ points: [], cityCode: null }), {
    points: [],
    cityCode: null,
  });

  const quote = cdekQuoteDataSchema.parse({
    available: true,
    sellerId: "64b000000000000000000001",
    options: [tariff],
    best: tariff,
    exact: false,
  });
  assert.equal(quote.best?.deliverySumRub, 320);
  assert.equal(quote.exact, false);
  // Служба недоступна: причина приходит полем, тарифов нет.
  assert.deepEqual(
    cdekQuoteDataSchema.parse({
      available: false,
      reason: "not_connected",
      options: [],
    }).options,
    [],
  );
});

test("выбор из приложения проходит схему заказа", () => {
  const selection = buildCdekOrderSelection({
    pointCode: point.code,
    tariffCode: tariff.tariffCode,
    cityCode: point.cityCode,
    recipientName: "Иван Петров",
    recipientPhone: "+7 900 123-45-67",
  });
  assert.ok(selection);
  const parsed = cdekOrderSelectionSchema.parse(selection);
  assert.equal(parsed.pickupPointCode, "MSK123");
  // Цены в выборе нет: её считает сервер по ключу продавца.
  assert.equal("deliverySumRub" in parsed, false);
});

test("форма оформления: СДЭК — служба внутри доставки", () => {
  const form = read("features/checkout/ui/CheckoutForm.tsx");
  assert.match(form, /resolveCheckoutChosenCarrier\(/);
  assert.match(form, /<CdekPickupPointPicker/);
  assert.match(form, /cdekShipment: cdekSelection/);
  // У СДЭК адрес заказа сервер берёт из пункта выдачи.
  assert.match(form, /CHECKOUT_FORM_UI\.CDEK_POINT_REQUIRED/);

  const picker = read("features/checkout/ui/CdekPickupPointPicker.tsx");
  assert.match(picker, /fetchCdekDeliveryPoints/);
  assert.match(picker, /fetchCdekQuote/);
  assert.match(picker, /buildCdekOrderSelection/);

  const cart = read("app/(tabs)/cart.tsx");
  assert.match(cart, /useCdekAvailabilityQuery\(cdekSellerId/);
  assert.match(cart, /cdekShipment: payload\.cdekShipment/);
  // «Доставка» доступна и тогда, когда у продавца есть только СДЭК.
  // Раскладку задаёт prettier — перенос строки внутри {} допустим.
  assert.match(cart, /deliveryAvailable=\{\s*deliveryAvailable \|\| cdekAvailable/);
});

test("ошибка СДЭК не глотается молча", () => {
  const api = read("entities/cdek/api/cdekCheckoutApi.ts");
  assert.doesNotMatch(api, /catch\s*\{/);
  assert.doesNotMatch(api, /catch\s*\([^)]*\)\s*\{\s*\}/);
  assert.match(api, /CHECKOUT_FORM_UI\.CDEK_UNAVAILABLE/);
});
