import assert from "node:assert/strict";
import test from "node:test";

import {
  SHIPPING_CARRIER_INFO_IDS,
  buildShippingCarrierInfoTelHref,
  hasShippingCarrierInfo,
  shippingCarrierInfoBodySchema,
  shippingCarrierInfoParamsSchema,
} from "../src/index.js";

test("справка есть у служб, но не у доставки продавцом", () => {
  assert.ok(SHIPPING_CARRIER_INFO_IDS.includes("lobo"));
  assert.ok(SHIPPING_CARRIER_INFO_IDS.includes("cdek"));
  assert.ok(!SHIPPING_CARRIER_INFO_IDS.includes("seller"));
  assert.equal(
    shippingCarrierInfoParamsSchema.safeParse({ carrierId: "seller" }).success,
    false,
  );
});

test("пустая справка — показывать нечего", () => {
  assert.equal(hasShippingCarrierInfo(null), false);
  assert.equal(hasShippingCarrierInfo({ description: "  ", phone: "" }), false);
  assert.equal(hasShippingCarrierInfo({ workHours: "Пн–Сб 9:00–20:00" }), true);
});

test("тело справки: пустые поля допустимы, пробелы срезаются", () => {
  const parsed = shippingCarrierInfoBodySchema.parse({ workHours: "  Ежедневно  " });
  assert.deepEqual(parsed, {
    description: "",
    workHours: "Ежедневно",
    coverage: "",
    phone: "",
    website: "",
  });
});

test("телефон и сайт проверяются, если заполнены", () => {
  assert.equal(
    shippingCarrierInfoBodySchema.safeParse({ phone: "звоните" }).success,
    false,
  );
  assert.equal(
    shippingCarrierInfoBodySchema.safeParse({ phone: "8 (800) 000-00-00" }).success,
    true,
  );
  assert.equal(
    shippingCarrierInfoBodySchema.safeParse({ website: "example.test" }).success,
    false,
  );
  assert.equal(
    shippingCarrierInfoBodySchema.safeParse({ website: "https://example.test" })
      .success,
    true,
  );
});

test("телефон превращается в ссылку для звонка", () => {
  assert.equal(buildShippingCarrierInfoTelHref("8 (800) 000-00-00"), "tel:88000000000");
  assert.equal(buildShippingCarrierInfoTelHref("+7 900 000-00-00"), "tel:+79000000000");
  assert.equal(buildShippingCarrierInfoTelHref(""), null);
});
