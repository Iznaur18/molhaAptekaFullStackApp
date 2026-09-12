import { describe, expect, it } from "vitest";

import { resolveCartSellerDelivery } from "./resolveCartSellerDelivery.js";

const TARIFF = { paid: true, baseFeeRub: 200, perKmRub: 30, freeFromRub: 5000 };

/** @param {Record<string, unknown>} [overrides] */
const buildProduct = (overrides = {}) => ({
  productDeliveryCarrier: "seller",
  productPickupLat: 43.3,
  productPickupLon: 45.7,
  productSeller: {
    _id: "s1",
    sellerFulfillmentDefaults: { deliveryTariff: TARIFF },
  },
  ...overrides,
});

/** @param {Record<string, unknown>} [productOverrides] */
const buildGroups = (productOverrides = {}) => [
  { sellerId: "s1", lines: [{ product: buildProduct(productOverrides) }] },
];

describe("доставка продавца в корзине", () => {
  it("отдаёт продавца и тариф — расстояние считает сервер", () => {
    const result = resolveCartSellerDelivery({
      sellerGroups: buildGroups(),
      fulfillmentBySellerId: { s1: "delivery" },
      goodsTotalRub: 1000,
    });

    expect(result).toEqual({
      sellerId: "s1",
      tariff: TARIFF,
      goodsTotalRub: 1000,
    });
  });

  it("при самовывозе тарифа нет", () => {
    expect(
      resolveCartSellerDelivery({
        sellerGroups: buildGroups(),
        fulfillmentBySellerId: { s1: "pickup" },
      }),
    ).toBeNull();
  });

  it("у курьеров Gitorg тариф продавца не применяется", () => {
    expect(
      resolveCartSellerDelivery({
        sellerGroups: buildGroups({
          productDeliveryCarrier: "gitorg_courier",
        }),
        fulfillmentBySellerId: { s1: "delivery" },
      }),
    ).toBeNull();
  });

  it("бесплатная доставка блок не показывает", () => {
    expect(
      resolveCartSellerDelivery({
        sellerGroups: buildGroups({
          productSeller: {
            _id: "s1",
            sellerFulfillmentDefaults: { deliveryTariff: { paid: false } },
          },
        }),
        fulfillmentBySellerId: { s1: "delivery" },
      }),
    ).toBeNull();
  });

  it("в сборной корзине сумму одного продавца не показываем", () => {
    const groups = [...buildGroups(), { sellerId: "s2", lines: [] }];
    expect(
      resolveCartSellerDelivery({
        sellerGroups: groups,
        fulfillmentBySellerId: { s1: "delivery", s2: "delivery" },
      }),
    ).toBeNull();
  });
});
