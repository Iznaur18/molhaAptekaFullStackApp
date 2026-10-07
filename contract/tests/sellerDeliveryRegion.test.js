import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  PRODUCT_DELIVERY_CARRIER_GITORG,
  PRODUCT_DELIVERY_CARRIER_LOBO,
  PRODUCT_DELIVERY_CARRIER_SELLER,
  SELLER_DELIVERY_OUT_OF_REGION_MESSAGE,
  SHIPPING_BUYER_REGION_UNKNOWN_MESSAGE,
  buildSellerDeliveryRegionBlockMessage,
  isSellerDeliveryOutsideRegionEnabled,
  resolveSellerDeliveryRegionBlock,
  sellerCommerceDefaultsBodySchema,
} from "../src/index.js";

const restricted = (overrides = {}) =>
  resolveSellerDeliveryRegionBlock({
    deliveryOutsideRegionEnabled: false,
    carrier: PRODUCT_DELIVERY_CARRIER_SELLER,
    sellerRegionCode: "RU-CE",
    buyerRegionCode: "RU-MOW",
    ...overrides,
  });

describe("доставка продавца в другие регионы", () => {
  it("без настройки продавец возит везде", () => {
    assert.equal(isSellerDeliveryOutsideRegionEnabled(null), true);
    assert.equal(isSellerDeliveryOutsideRegionEnabled({}), true);
    assert.equal(
      isSellerDeliveryOutsideRegionEnabled({ sellerFulfillmentDefaults: {} }),
      true,
    );
    assert.equal(
      isSellerDeliveryOutsideRegionEnabled({
        sellerFulfillmentDefaults: { deliveryOutsideRegionEnabled: false },
      }),
      false,
    );
    assert.equal(restricted({ deliveryOutsideRegionEnabled: true }), null);
  });

  it("выключено — чужой регион не заказывает доставку", () => {
    assert.equal(restricted(), "seller_region");
    assert.equal(restricted({ buyerRegionCode: "ru-ce" }), null);
    assert.equal(
      restricted({ carrier: PRODUCT_DELIVERY_CARRIER_GITORG }),
      "seller_region",
    );
  });

  it("регион покупателя неизвестен — отказ, регион продажи неизвестен — пропуск", () => {
    assert.equal(restricted({ buyerRegionCode: "" }), "buyer_region_unknown");
    assert.equal(restricted({ sellerRegionCode: "" }), null);
  });

  it("на службы доставки настройка не действует", () => {
    assert.equal(restricted({ carrier: PRODUCT_DELIVERY_CARRIER_LOBO }), null);
    assert.equal(restricted({ carrier: "cdek" }), null);
    assert.equal(restricted({ carrier: null }), null);
  });

  it("тексты отказа", () => {
    assert.equal(
      buildSellerDeliveryRegionBlockMessage("seller_region"),
      SELLER_DELIVERY_OUT_OF_REGION_MESSAGE,
    );
    assert.equal(
      buildSellerDeliveryRegionBlockMessage("buyer_region_unknown"),
      SHIPPING_BUYER_REGION_UNKNOWN_MESSAGE,
    );
  });

  it("схема профиля пропускает настройку и не требует её", () => {
    const base = {
      pickupLocations: [
        {
          address: "Грозный, проспект Путина, 1",
          lat: 43.3,
          lon: 45.7,
          isDefault: true,
        },
      ],
      pickupEnabled: true,
      deliveryCarrier: PRODUCT_DELIVERY_CARRIER_SELLER,
      paymentMethods: ["cashOnDelivery"],
    };
    assert.equal(
      sellerCommerceDefaultsBodySchema.parse(base).deliveryOutsideRegionEnabled,
      undefined,
    );
    assert.equal(
      sellerCommerceDefaultsBodySchema.parse({
        ...base,
        deliveryOutsideRegionEnabled: false,
      }).deliveryOutsideRegionEnabled,
      false,
    );
  });
});
