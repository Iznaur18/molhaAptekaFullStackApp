import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  PLATFORM_COMMISSION_PERCENT_DEFAULT,
  PLATFORM_COMMISSION_PERCENT_MAX,
  normalizePlatformCommissionPercent,
  splitOrderAmountForPlatform,
} from "../src/index.js";

describe("ставка комиссии", () => {
  it("по умолчанию два процента", () => {
    assert.equal(PLATFORM_COMMISSION_PERCENT_DEFAULT, 2);
  });

  it("мусор и отрицательные значения падают на дефолт", () => {
    assert.equal(normalizePlatformCommissionPercent(null), 2);
    assert.equal(normalizePlatformCommissionPercent("abc"), 2);
    assert.equal(normalizePlatformCommissionPercent(-5), 2);
  });

  it("абсурдная ставка режется по потолку", () => {
    assert.equal(
      normalizePlatformCommissionPercent(900),
      PLATFORM_COMMISSION_PERCENT_MAX,
    );
  });
});

describe("деление суммы отправления", () => {
  it("два процента от товаров", () => {
    const split = splitOrderAmountForPlatform({ goodsRub: 1000 });
    assert.equal(split.commissionRub, 20);
    assert.equal(split.sellerRub, 980);
    assert.equal(split.totalRub, 1000);
  });

  it("доставка продавца комиссией не облагается, но продавцу достаётся", () => {
    const split = splitOrderAmountForPlatform({ goodsRub: 1000, deliveryRub: 200 });

    assert.equal(split.commissionBaseRub, 1000, "база — только товары");
    assert.equal(split.commissionRub, 20);
    assert.equal(
      split.sellerRub,
      1180,
      "980 за товар плюс вся доставка: бензин продавец оплачивает не пополам",
    );
    assert.equal(split.totalRub, 1200);
  });

  it("сумма долей всегда равна принятой сумме", () => {
    for (const goodsRub of [1, 7, 33, 99, 101, 4999, 123457]) {
      const split = splitOrderAmountForPlatform({ goodsRub, deliveryRub: 13 });
      assert.equal(
        split.commissionRub + split.sellerRub,
        split.totalRub,
        `копейка потерялась на ${goodsRub}`,
      );
    }
  });

  it("копейка округления достаётся продавцу, а не площадке", () => {
    // 2% от 99 ₽ = 1.98 ₽ — вниз, не вверх.
    const split = splitOrderAmountForPlatform({ goodsRub: 99 });
    assert.equal(split.commissionRub, 1);
    assert.equal(split.sellerRub, 98);
  });

  it("на мелкой сумме комиссия честно равна нулю", () => {
    const split = splitOrderAmountForPlatform({ goodsRub: 10 });
    assert.equal(split.commissionRub, 0, "0.2 ₽ вниз — это ноль, а не рубль");
    assert.equal(split.sellerRub, 10);
  });

  it("нулевой заказ не даёт отрицательных долей", () => {
    const split = splitOrderAmountForPlatform({ goodsRub: 0, deliveryRub: 0 });
    assert.equal(split.commissionRub, 0);
    assert.equal(split.sellerRub, 0);
  });
});
