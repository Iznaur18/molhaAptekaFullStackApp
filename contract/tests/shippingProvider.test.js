import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  SHIPPING_PROVIDER_CDEK,
  SHIPPING_PROVIDER_PRIMARY,
  SHIPPING_PROVIDER_RUSSIAN_POST,
  SHIPPING_PROVIDER_YANDEX_DELIVERY,
  SHIPPING_PROVIDERS,
  SHIPPING_PROVIDERS_CHECKOUT_SOON_HINT,
  SHIPPING_PROVIDERS_ENABLED,
  buildShippingTrackingUrl,
  isShippingProviderLive,
  orderShippingStubFieldsSchema,
  resolveOrderShippingTrackingUrl,
  shippingProviderSchema,
} from "../src/index.js";

describe("shippingProvider scaffold", () => {
  it("lists three providers and keeps global flag off", () => {
    assert.deepEqual([...SHIPPING_PROVIDERS], [
      SHIPPING_PROVIDER_CDEK,
      SHIPPING_PROVIDER_YANDEX_DELIVERY,
      SHIPPING_PROVIDER_RUSSIAN_POST,
    ]);
    assert.equal(SHIPPING_PROVIDERS_ENABLED, false);
    assert.equal(SHIPPING_PROVIDER_PRIMARY, SHIPPING_PROVIDER_CDEK);
    assert.equal(isShippingProviderLive(SHIPPING_PROVIDER_CDEK), false);
  });

  it("parses provider enum", () => {
    assert.equal(shippingProviderSchema.parse("cdek"), "cdek");
    assert.equal(shippingProviderSchema.safeParse("dpd").success, false);
  });

  it("accepts nullable order shipping stub fields", () => {
    const parsed = orderShippingStubFieldsSchema.parse({
      shippingProvider: "cdek",
      shippingServiceType: "pickup_point",
      shippingTrackingNumber: "123",
      shippingTrackingUrl: null,
      shippingExternalId: null,
      shippingCarrierStatus: null,
    });
    assert.equal(parsed.shippingProvider, "cdek");
  });

  it("builds public tracking URLs", () => {
    assert.equal(
      buildShippingTrackingUrl(SHIPPING_PROVIDER_CDEK, "AB-1"),
      "https://www.cdek.ru/ru/tracking?order_id=AB-1",
    );
    assert.equal(
      buildShippingTrackingUrl(SHIPPING_PROVIDER_RUSSIAN_POST, "RA123"),
      "https://www.pochta.ru/tracking#RA123",
    );
    assert.equal(
      buildShippingTrackingUrl(SHIPPING_PROVIDER_YANDEX_DELIVERY, "x"),
      null,
    );
  });

  it("prefers explicit tracking URL on order", () => {
    assert.equal(
      resolveOrderShippingTrackingUrl({
        shippingTrackingUrl: "https://example.test/t/1",
        shippingProvider: SHIPPING_PROVIDER_CDEK,
        shippingTrackingNumber: "AB-1",
      }),
      "https://example.test/t/1",
    );
  });

  it("exposes checkout soon hint with all labels", () => {
    assert.match(SHIPPING_PROVIDERS_CHECKOUT_SOON_HINT, /СДЭК/);
    assert.match(SHIPPING_PROVIDERS_CHECKOUT_SOON_HINT, /Яндекс Доставка/);
    assert.match(SHIPPING_PROVIDERS_CHECKOUT_SOON_HINT, /Почта России/);
  });
});
