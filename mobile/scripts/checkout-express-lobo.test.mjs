import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import {
  buildYandexExpressOrderSelection,
  resolveOrderDeliveryGeo,
} from "../features/checkout/lib/yandexExpressSelection.ts";
import { resolveCartGroupDeliveryHint } from "../entities/cart/lib/resolveCartGroupDeliveryHint.ts";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("«Экспресс»: получатель как на сайте — имя от 2 букв, телефон от 10 знаков", () => {
  const ok = {
    quoteAvailable: true,
    recipientName: " Ив ",
    recipientPhone: "+7 900 000",
  };
  assert.deepEqual(buildYandexExpressOrderSelection(ok), {
    recipient: { name: "Ив", phone: "+7 900 000" },
  });
  assert.equal(
    buildYandexExpressOrderSelection({ ...ok, quoteAvailable: false }),
    null,
  );
  assert.equal(buildYandexExpressOrderSelection({ ...ok, recipientName: "И" }), null);
  assert.equal(
    buildYandexExpressOrderSelection({ ...ok, recipientPhone: "123" }),
    null,
  );
});

test("точка адреса уходит в заказ, если она полная", () => {
  assert.deepEqual(resolveOrderDeliveryGeo({ geo: { lat: 43.3, lon: 45.7 } }), {
    lat: 43.3,
    lon: 45.7,
  });
  assert.equal(resolveOrderDeliveryGeo({ geo: null }), null);
  assert.equal(resolveOrderDeliveryGeo({ geo: { lat: Number.NaN, lon: 45 } }), null);

  const form = read("features/checkout/ui/CheckoutForm.tsx");
  assert.match(form, /deliveryAddressGeo,/);
  const cart = read("app/(tabs)/cart.tsx");
  assert.match(cart, /deliveryAddressGeo: payload\.deliveryAddressGeo/);
  assert.match(read("entities/order/api/createOrder.ts"), /deliveryAddressGeo\?:/);
});

test("«Экспресс» в оформлении: служба продавца, только картой, по точке адреса", () => {
  const form = read("features/checkout/ui/CheckoutForm.tsx");
  assert.match(form, /id: SHIPPING_PROVIDER_YANDEX_EXPRESS/);
  assert.match(form, /const cardOnlyCarrier = yandexChosen \|\| expressChosen;/);
  assert.match(form, /!expressSelection \|\| !deliveryAddressGeo/);
  assert.match(form, /yandexExpressShipment: expressSelection/);

  const cart = read("app/(tabs)/cart.tsx");
  assert.match(cart, /yandexAvailabilityQuery\.data\?\.expressAvailable === true/);
  assert.match(cart, /express=\{expressConfig\}/);

  const panel = read("features/checkout/ui/YandexExpressPanel.tsx");
  assert.match(panel, /fetchYandexExpressQuote\(/);
  assert.match(panel, /CHECKOUT_FORM_UI\.YANDEX_EXPRESS_NEED_GEO/);
});

test("ЛОБО: подпись службы, примерная цена курьеру и запрет вне зоны", () => {
  assert.deepEqual(
    resolveCartGroupDeliveryHint(
      { deliveryAvailable: true, deliveryCarrier: "lobo", lines: [] },
      0,
    ),
    { kind: "lobo" },
  );

  const form = read("features/checkout/ui/CheckoutForm.tsx");
  assert.match(
    form,
    /productCarrier === PRODUCT_DELIVERY_CARRIER_LOBO && chosenCarrier == null/,
  );
  assert.match(form, /Boolean\(shippingBlockMessage\)/);
  assert.match(form, /CHECKOUT_FORM_UI\.SHIPPING_PROVIDER_LOBO/);

  const estimate = read("features/checkout/ui/CheckoutShippingEstimate.tsx");
  assert.match(estimate, /estimate\.blocking === true/);
  assert.match(estimate, /estimate\.reason === "not_external"/);
  assert.match(
    read("entities/cart/api/fetchShippingEstimate.ts"),
    /\/order\/shipping-estimate/,
  );
});

test("цена службы входит в итог корзины вместо «К оплате»", () => {
  const form = read("features/checkout/ui/CheckoutForm.tsx");
  assert.match(form, /<CheckoutCarrierDeliveryCost cost=\{serviceCost\}/);
  assert.equal(form.match(/onCost=\{setCarrierCost\}/g)?.length, 3);
  assert.match(form, /cost: loboCost/);
  assert.match(
    read("app/(tabs)/cart.tsx"),
    /goodsTotalRub=\{activeSellerEntry\.summary\.selectedTotal\}/,
  );
  for (const picker of [
    "CdekPickupPointPicker",
    "YandexPickupPointPicker",
    "YandexExpressPanel",
  ]) {
    assert.match(
      read(`features/checkout/ui/${picker}.tsx`),
      /onCost\?\.\(|onCost\(/,
      picker,
    );
  }
  const cost = read("features/checkout/ui/CheckoutCarrierDeliveryCost.tsx");
  assert.match(cost, /goods \+ feeRub/);
});

test("тексты совпадают с сайтом", () => {
  const web = read("../client/src/shared/config/copy/cart-checkout.js");
  const mobile = read("shared/config/appUiCopy.ts");
  for (const key of [
    "DELIVERY_HINT_LOBO",
    "YANDEX_EXPRESS_REQUIRED",
    "YANDEX_EXPRESS_CARD_HINT",
    "YANDEX_EXPRESS_NEED_GEO",
    "YANDEX_EXPRESS_PRICING",
    "YANDEX_EXPRESS_UNAVAILABLE",
    "SHIPPING_PROVIDER_YANDEX_EXPRESS",
    "SHIPPING_ESTIMATE_UNAVAILABLE",
    "SHIPPING_ESTIMATE_OUT_OF_ZONE",
  ]) {
    const value = new RegExp(`\\n  ${key}:\\s*"([^"]+)"`).exec(web)?.[1];
    assert.ok(value, key);
    assert.ok(mobile.includes(`"${value}"`), key);
  }
});
