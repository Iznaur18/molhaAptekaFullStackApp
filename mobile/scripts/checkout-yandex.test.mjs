import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import {
  yandexDeliveryAvailabilityDataSchema,
  yandexDeliveryOrderSelectionSchema,
  yandexDeliveryPointsDataSchema,
  yandexDeliveryQuoteDataSchema,
} from "@molha/api-contract";
import { buildYandexDeliveryOrderSelection } from "@izibuy/shared-lib";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("ответы Яндекс Доставки читаются схемами контракта", () => {
  assert.deepEqual(
    yandexDeliveryAvailabilityDataSchema.parse({
      available: true,
      expressAvailable: false,
    }),
    { available: true, expressAvailable: false },
  );
  // Старый сервер мог не знать про «Экспресс» — поле необязательное.
  assert.equal(
    yandexDeliveryAvailabilityDataSchema.parse({ available: false }).expressAvailable,
    false,
  );

  // Так пункт отдаёт сервер (`readYandexPoint`).
  const points = yandexDeliveryPointsDataSchema.parse({
    points: [
      {
        id: "ya-point-1",
        name: "ПВЗ на Ленина",
        address: "Грозный, пр-кт Путина, 1",
        city: "Грозный",
        geoId: 1106,
        lat: 43.31,
        lon: 45.69,
        instruction: "Вход со двора",
        paymentMethods: ["card_on_receipt"],
        availableForDropoff: false,
      },
    ],
  });
  assert.equal(points.points[0].address, "Грозный, пр-кт Путина, 1");
  assert.equal(points.points[0].instruction, "Вход со двора");
  assert.deepEqual(yandexDeliveryPointsDataSchema.parse({}).points, []);

  const quote = yandexDeliveryQuoteDataSchema.parse({
    available: true,
    sellerId: "64b000000000000000000001",
    deliverySumRub: 240,
    deliveryDays: 3,
    exact: true,
  });
  assert.equal(quote.deliverySumRub, 240);
  // Служба недоступна: цены нет, причина приходит полем.
  assert.equal(
    yandexDeliveryQuoteDataSchema.parse({ available: false, reason: "no_dropoff" })
      .available,
    false,
  );
});

test("выбор из приложения проходит схему заказа", () => {
  const selection = buildYandexDeliveryOrderSelection({
    pointId: "ya-point-1",
    quoteAvailable: true,
    recipientName: "Иван Петров",
    recipientPhone: "+7 900 123-45-67",
  });
  assert.ok(selection);
  assert.equal(
    yandexDeliveryOrderSelectionSchema.parse(selection).pickupPointId,
    "ya-point-1",
  );
});

test("форма оформления: Яндекс — служба внутри доставки, оплата только картой", () => {
  const form = read("features/checkout/ui/CheckoutForm.tsx");
  assert.match(form, /<YandexPickupPointPicker/);
  assert.match(form, /yandexDeliveryShipment: yandexSelection/);
  assert.match(form, /resolveCardOnlyAllowedPaymentMethods\(allowedPaymentMethods\)/);
  assert.match(form, /CHECKOUT_FORM_UI\.YANDEX_CARD_ONLY_HINT/);
  // Способ оплаты проверяется и перед отправкой, а не только в выборе.
  assert.match(form, /paymentMethod !== ORDER_PAYMENT_METHOD_CARD_ON_DELIVERY/);

  const picker = read("features/checkout/ui/YandexPickupPointPicker.tsx");
  assert.match(picker, /fetchYandexDeliveryPoints/);
  // Цена считается под выбранный пункт, а не под город.
  assert.match(picker, /fetchYandexDeliveryQuote\(/);
  assert.match(picker, /pickupPointId: pointId/);
  assert.match(picker, /buildYandexDeliveryOrderSelection/);

  const cart = read("app/(tabs)/cart.tsx");
  assert.match(cart, /useYandexDeliveryAvailabilityQuery\(cdekSellerId/);
  // Продавец отключил «картой при получении» — Яндекс не предлагаем.
  assert.match(cart, /isCardOnDeliveryAccepted\(allowedPaymentMethods\)/);
  assert.match(cart, /yandexDeliveryShipment: payload\.yandexDeliveryShipment/);
});

test("СДЭК и Яндекс делят один список пунктов и поля получателя", () => {
  for (const file of [
    "features/checkout/ui/CdekPickupPointPicker.tsx",
    "features/checkout/ui/YandexPickupPointPicker.tsx",
  ]) {
    const picker = read(file);
    assert.match(picker, /<CarrierPickupPointList/, file);
    assert.match(picker, /<CarrierCitySearch/, file);
    assert.match(picker, /<CarrierRecipientFields/, file);
  }
});

test("ошибка Яндекса не глотается молча", () => {
  const api = read("entities/yandex-delivery/api/yandexDeliveryCheckoutApi.ts");
  assert.doesNotMatch(api, /catch\s*\{/);
  assert.match(api, /CHECKOUT_FORM_UI\.YANDEX_UNAVAILABLE/);
});
