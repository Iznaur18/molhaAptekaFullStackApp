import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  FREE_SELLER_DELIVERY_TARIFF,
  calculateSellerDeliveryFee,
  normalizeSellerDeliveryTariff,
  resolveSellerDeliveryTariff,
  sellerCommerceDefaultsBodySchema,
  sellerDeliveryDistanceKm,
  sellerDeliveryTariffSchema,
} from "../src/index.js";

const PAID = { paid: true, baseFeeRub: 200, perKmRub: 30, freeFromRub: 5000 };

const POINT = {
  address: "Грозный, проспект Путина, 1",
  lat: 43.3,
  lon: 45.7,
  isDefault: true,
};

describe("нормализация тарифа", () => {
  it("нет тарифа — бесплатно", () => {
    assert.deepEqual(normalizeSellerDeliveryTariff(null), FREE_SELLER_DELIVERY_TARIFF);
    assert.deepEqual(normalizeSellerDeliveryTariff({}), FREE_SELLER_DELIVERY_TARIFF);
  });

  it("платный тариф без единой цены неотличим от бесплатного", () => {
    assert.deepEqual(
      normalizeSellerDeliveryTariff({ paid: true, baseFeeRub: 0, perKmRub: 0 }),
      FREE_SELLER_DELIVERY_TARIFF,
    );
  });

  it("отрицательные и дробные значения срезаются", () => {
    assert.deepEqual(
      normalizeSellerDeliveryTariff({
        paid: true,
        baseFeeRub: 199.7,
        perKmRub: -5,
        freeFromRub: -1,
      }),
      { paid: true, baseFeeRub: 199, perKmRub: 0, freeFromRub: 0 },
    );
  });

  it("читается из профиля продавца", () => {
    assert.deepEqual(
      resolveSellerDeliveryTariff({
        sellerFulfillmentDefaults: { deliveryTariff: PAID },
      }),
      PAID,
    );
    assert.deepEqual(resolveSellerDeliveryTariff({}), FREE_SELLER_DELIVERY_TARIFF);
  });
});

describe("расчёт стоимости доставки", () => {
  it("бесплатный тариф — ноль", () => {
    const result = calculateSellerDeliveryFee({
      tariff: FREE_SELLER_DELIVERY_TARIFF,
      goodsTotalRub: 100,
      distanceKm: 12,
    });
    assert.equal(result.feeRub, 0);
    assert.equal(result.isFree, true);
  });

  it("вызов плюс километраж, неполный километр — как целый", () => {
    const result = calculateSellerDeliveryFee({
      tariff: PAID,
      goodsTotalRub: 1000,
      distanceKm: 4.2,
    });
    // 200 за вызов + 5 км * 30
    assert.equal(result.feeRub, 350);
    assert.equal(result.isEstimate, false);
  });

  it("порог бесплатной доставки перебивает километраж", () => {
    const result = calculateSellerDeliveryFee({
      tariff: PAID,
      goodsTotalRub: 5000,
      distanceKm: 40,
    });
    assert.equal(result.feeRub, 0);
    assert.equal(result.isFree, true);
  });

  it("без адреса километраж не начисляется, сумма помечается как оценка", () => {
    const result = calculateSellerDeliveryFee({
      tariff: PAID,
      goodsTotalRub: 1000,
      distanceKm: null,
    });
    assert.equal(result.feeRub, 200, "остаётся цена за вызов");
    assert.equal(result.isEstimate, true);
  });

  it("без километража сумма точна даже без адреса", () => {
    const result = calculateSellerDeliveryFee({
      tariff: { paid: true, baseFeeRub: 300, perKmRub: 0, freeFromRub: 0 },
      goodsTotalRub: 1000,
      distanceKm: null,
    });
    assert.equal(result.feeRub, 300);
    assert.equal(result.isEstimate, false);
  });

  it("абсурдное расстояние не превращается в счёт", () => {
    const result = calculateSellerDeliveryFee({
      tariff: PAID,
      goodsTotalRub: 100,
      distanceKm: 99_999,
    });
    assert.equal(result.feeRub, 200);
    assert.equal(result.isEstimate, true);
  });
});

describe("расстояние по прямой", () => {
  it("считает километры между точками", () => {
    const km = sellerDeliveryDistanceKm(
      { lat: 43.3, lon: 45.7 },
      { lat: 43.4, lon: 45.7 },
    );
    assert.ok(km > 11 && km < 12, `ожидали ~11 км, получили ${km}`);
  });

  it("без координат расстояния нет", () => {
    assert.equal(sellerDeliveryDistanceKm(null, { lat: 43, lon: 45 }), null);
    assert.equal(
      sellerDeliveryDistanceKm({ lat: 43, lon: null }, { lat: 43, lon: 45 }),
      null,
    );
  });
});

describe("тариф в настройках продавца", () => {
  const base = {
    pickupLocations: [POINT],
    pickupEnabled: true,
    paymentMethods: ["cashOnDelivery"],
  };

  it("платный тариф проходит со своей доставкой", () => {
    const parsed = sellerCommerceDefaultsBodySchema.safeParse({
      ...base,
      deliveryCarrier: "seller",
      deliveryTariff: PAID,
    });
    assert.equal(parsed.success, true);
  });

  it("платный тариф с чужим перевозчиком отклоняется", () => {
    const parsed = sellerCommerceDefaultsBodySchema.safeParse({
      ...base,
      deliveryCarrier: "gitorg_courier",
      deliveryTariff: PAID,
    });
    assert.equal(parsed.success, false);
  });

  it("бесплатный тариф не мешает никакому перевозчику", () => {
    const parsed = sellerCommerceDefaultsBodySchema.safeParse({
      ...base,
      deliveryCarrier: "gitorg_courier",
      deliveryTariff: FREE_SELLER_DELIVERY_TARIFF,
    });
    assert.equal(parsed.success, true);
  });

  it("платный тариф без единой цены отклоняется схемой", () => {
    const parsed = sellerDeliveryTariffSchema.safeParse({
      paid: true,
      baseFeeRub: 0,
      perKmRub: 0,
      freeFromRub: 0,
    });
    assert.equal(parsed.success, false);
  });
});
