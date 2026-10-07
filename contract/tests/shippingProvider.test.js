import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  SHIPPING_BUYER_REGION_UNKNOWN_MESSAGE,
  SHIPPING_PROVIDER_LOBO,
  SHIPPING_PROVIDER_CDEK,
  SHIPPING_PROVIDER_PRIMARY,
  SHIPPING_PROVIDER_RUSSIAN_POST,
  SHIPPING_PROVIDER_YANDEX_DELIVERY,
  SHIPPING_PROVIDERS,
  SHIPPING_PROVIDERS_CHECKOUT_SOON_HINT,
  SHIPPING_PROVIDERS_ENABLED,
  buildShippingBuyerRegionBlockMessage,
  buildShippingTrackingUrl,
  resolveShippingBuyerRegionBlock,
  isShippingProviderLive,
  isShippingProviderAvailableInRegion,
  listLiveShippingProvidersForRegion,
  orderShippingStubFieldsSchema,
  resolveOrderShippingTrackingUrl,
  shippingProviderSchema,
} from "../src/index.js";

describe("shippingProvider scaffold", () => {
  it("ЛОБО живая, остальные ждут ключей", () => {
    assert.deepEqual(
      [...SHIPPING_PROVIDERS],
      [
        SHIPPING_PROVIDER_LOBO,
        SHIPPING_PROVIDER_CDEK,
        SHIPPING_PROVIDER_YANDEX_DELIVERY,
        SHIPPING_PROVIDER_RUSSIAN_POST,
      ],
    );
    assert.equal(SHIPPING_PROVIDERS_ENABLED, true);
    assert.equal(SHIPPING_PROVIDER_PRIMARY, SHIPPING_PROVIDER_LOBO);
    assert.equal(isShippingProviderLive(SHIPPING_PROVIDER_LOBO), true);
    assert.equal(isShippingProviderLive(SHIPPING_PROVIDER_CDEK), false);
  });

  it("ЛОБО показывается только в Чечне", () => {
    assert.equal(
      isShippingProviderAvailableInRegion(SHIPPING_PROVIDER_LOBO, "RU-CE"),
      true,
    );
    assert.equal(
      isShippingProviderAvailableInRegion(SHIPPING_PROVIDER_LOBO, "RU-MOW"),
      false,
      "иначе обещаем доставку, которой в этом регионе нет",
    );
    // Регион неизвестен — службу с ограничением не предлагаем.
    assert.equal(
      isShippingProviderAvailableInRegion(SHIPPING_PROVIDER_LOBO, ""),
      false,
    );
    // У службы без ограничений регион не спрашиваем.
    assert.equal(
      isShippingProviderAvailableInRegion(SHIPPING_PROVIDER_CDEK, "RU-MOW"),
      true,
    );
  });

  it("ЛОБО не везёт покупателю из другого региона", () => {
    assert.equal(
      resolveShippingBuyerRegionBlock(SHIPPING_PROVIDER_LOBO, "RU-CE"),
      null,
    );
    assert.equal(
      resolveShippingBuyerRegionBlock(SHIPPING_PROVIDER_LOBO, "RU-MOW"),
      "buyer_region",
      "товар из Грозного заказали с доставкой в Москву",
    );
    // Регион адреса не определился — с зональной службой не пускаем.
    assert.equal(
      resolveShippingBuyerRegionBlock(SHIPPING_PROVIDER_LOBO, null),
      "buyer_region_unknown",
    );
    // Службы без зоны и доставка продавцом регион покупателя не проверяют.
    assert.equal(
      resolveShippingBuyerRegionBlock(SHIPPING_PROVIDER_CDEK, "RU-MOW"),
      null,
    );
    assert.equal(resolveShippingBuyerRegionBlock("seller", ""), null);
    assert.equal(resolveShippingBuyerRegionBlock(null, "RU-MOW"), null);

    assert.match(
      buildShippingBuyerRegionBlockMessage(SHIPPING_PROVIDER_LOBO, "buyer_region"),
      /ЛОБО доставляет только по Чеченской Республике/,
    );
    assert.equal(
      buildShippingBuyerRegionBlockMessage(
        SHIPPING_PROVIDER_LOBO,
        "buyer_region_unknown",
      ),
      SHIPPING_BUYER_REGION_UNKNOWN_MESSAGE,
    );
  });

  it("живые службы региона", () => {
    assert.deepEqual(listLiveShippingProvidersForRegion("RU-CE"), [
      SHIPPING_PROVIDER_LOBO,
    ]);
    assert.deepEqual(listLiveShippingProvidersForRegion("RU-MOW"), []);
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
