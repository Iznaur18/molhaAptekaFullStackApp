import assert from "node:assert/strict";
import { test } from "node:test";

import {
  formatLoyaltyPointsAmount,
  formatProductDealPrice,
  isProductPointsSaleActive,
  normalizeProductPointsPerBuyerLimit,
  normalizeProductPointsPrice,
  patchMyProductBodySchema,
  splitPointsSaleForPlatform,
} from "../src/index.js";

test("продаётся за баллы только с флагом и ценой", () => {
  assert.equal(
    isProductPointsSaleActive({
      productPointsSaleEnabled: true,
      productPointsPrice: 1,
    }),
    true,
  );
  assert.equal(
    isProductPointsSaleActive({
      productPointsSaleEnabled: true,
      productPointsPrice: null,
    }),
    false,
  );
  assert.equal(
    isProductPointsSaleActive({
      productPointsSaleEnabled: false,
      productPointsPrice: 50,
    }),
    false,
  );
  assert.equal(isProductPointsSaleActive(null), false);
});

test("пустая цена в баллах — не «бесплатно»", () => {
  assert.equal(normalizeProductPointsPrice(null), null);
  assert.equal(normalizeProductPointsPrice(""), null);
  assert.equal(normalizeProductPointsPrice(0), null);
  assert.equal(normalizeProductPointsPrice(12.7), 12);
});

test("лимит в одни руки: нет поля — по умолчанию 1, null — без ограничения", () => {
  assert.equal(normalizeProductPointsPerBuyerLimit(undefined), 1);
  assert.equal(normalizeProductPointsPerBuyerLimit(null), null);
  assert.equal(normalizeProductPointsPerBuyerLimit(5), 5);
});

test("комиссия 2% вверх, сумма сходится", () => {
  assert.deepEqual(splitPointsSaleForPlatform(250), {
    total: 250,
    commission: 5,
    seller: 245,
  });
  assert.deepEqual(splitPointsSaleForPlatform(1), {
    total: 1,
    commission: 1,
    seller: 0,
  });
  const { total, commission, seller } = splitPointsSaleForPlatform(1234);
  assert.equal(commission + seller, total);
});

test("цена товара за баллы показывается в баллах", () => {
  assert.equal(formatLoyaltyPointsAmount(1), "1 балл");
  assert.equal(formatLoyaltyPointsAmount(3), "3 балла");
  assert.equal(
    formatProductDealPrice(
      { productPointsSaleEnabled: true, productPointsPrice: 1500 },
      "900 ₽",
    ),
    formatLoyaltyPointsAmount(1500),
  );
});

test("PATCH товара не срезает поля продажи за баллы", () => {
  const parsed = patchMyProductBodySchema.parse({
    productPointsSaleEnabled: true,
    productPointsPrice: 300,
    productPointsPerBuyerLimit: null,
  });
  assert.deepEqual(parsed, {
    productPointsSaleEnabled: true,
    productPointsPrice: 300,
    productPointsPerBuyerLimit: null,
  });
});
