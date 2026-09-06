import assert from "node:assert/strict";
import { describe, it } from "node:test";

const {
  calculateProductPromotionAmountRub,
  normalizeProductPromotionAmountRub,
  PRODUCT_PROMOTION_MIN_AMOUNT_RUB,
  PRODUCT_PROMOTION_TIER_GOLD,
  PRODUCT_PROMOTION_TIER_BANNER,
} = await import("../constants/productPromotionConstants.js");

describe("цена продвижения", () => {
  it("дешёвый товар всё равно даёт оплачиваемый счёт", () => {
    // 1 ₽ × 0.2% × 1 = 0.002 ₽. Такая заявка создавалась, но платёжный слой
    // округлял счёт в ноль и отбивал его — продвижение висело вечно.
    const amount = calculateProductPromotionAmountRub({
      productPrice: 1,
      tier: PRODUCT_PROMOTION_TIER_GOLD,
      durationCode: "24h",
    });

    assert.equal(amount, PRODUCT_PROMOTION_MIN_AMOUNT_RUB);
  });

  it("сумма всегда целая: провайдер принимает рубли, а не доли", () => {
    // 750 ₽ × 1% × 23 = 172.5 ₽ — раньше продавцу называли 172.5, а списывали 173.
    const amount = calculateProductPromotionAmountRub({
      productPrice: 750,
      tier: PRODUCT_PROMOTION_TIER_BANNER,
      durationCode: "30d",
    });

    assert.equal(amount, 173);
    assert.ok(Number.isInteger(amount));
  });

  it("округление вверх: это цена услуги площадки, а не чужие деньги", () => {
    assert.equal(
      calculateProductPromotionAmountRub({
        productPrice: 750,
        tier: PRODUCT_PROMOTION_TIER_GOLD,
        durationCode: "24h",
      }),
      2,
      "750 × 0.2% = 1.5 ₽",
    );
  });

  it("длинный срок дороже суток", () => {
    const day = calculateProductPromotionAmountRub({
      productPrice: 5000,
      tier: PRODUCT_PROMOTION_TIER_GOLD,
      durationCode: "24h",
    });
    const month = calculateProductPromotionAmountRub({
      productPrice: 5000,
      tier: PRODUCT_PROMOTION_TIER_GOLD,
      durationCode: "30d",
    });

    assert.ok(month > day, `${month} должно быть больше ${day}`);
  });

  it("неизвестный уровень или срок — ноль, а не счёт из ниоткуда", () => {
    assert.equal(
      calculateProductPromotionAmountRub({
        productPrice: 750,
        tier: 99,
        durationCode: "24h",
      }),
      0,
    );
    assert.equal(
      calculateProductPromotionAmountRub({
        productPrice: 750,
        tier: PRODUCT_PROMOTION_TIER_GOLD,
        durationCode: "100y",
      }),
      0,
    );
  });

  it("бесплатный товар не превращается в счёт на рубль", () => {
    assert.equal(
      calculateProductPromotionAmountRub({
        productPrice: 0,
        tier: PRODUCT_PROMOTION_TIER_GOLD,
        durationCode: "24h",
      }),
      0,
      "ноль означает «посчитать не смогли», и заявка такого счёта не получит",
    );
  });
});

describe("нормализация суммы", () => {
  it("поднимает копейки до минимума, целое оставляет как есть", () => {
    assert.equal(normalizeProductPromotionAmountRub(0.002), 1);
    assert.equal(normalizeProductPromotionAmountRub(0.9), 1);
    assert.equal(normalizeProductPromotionAmountRub(1), 1);
    assert.equal(normalizeProductPromotionAmountRub(172.5), 173);
    assert.equal(normalizeProductPromotionAmountRub(173), 173);
  });

  it("мусор и ноль остаются нулём", () => {
    assert.equal(normalizeProductPromotionAmountRub(0), 0);
    assert.equal(normalizeProductPromotionAmountRub(-5), 0);
    assert.equal(normalizeProductPromotionAmountRub(null), 0);
    assert.equal(normalizeProductPromotionAmountRub("abc"), 0);
    assert.equal(normalizeProductPromotionAmountRub(undefined), 0);
  });
});
