import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import {
  applyPromoReturnStreakDiscount,
  getPromoReturnStreakDiscountPercent,
} from "@molha/api-contract";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT = join(MOBILE_ROOT, "../client/src");

const readMobile = (p) => readFileSync(join(MOBILE_ROOT, p), "utf8");
const readClient = (p) => readFileSync(join(CLIENT, p), "utf8");

test("applyPromoReturnStreakDiscount matches contract floor", () => {
  assert.equal(applyPromoReturnStreakDiscount(100, 95), 5);
  assert.equal(applyPromoReturnStreakDiscount(1, 95), 1);
  assert.equal(applyPromoReturnStreakDiscount(7000, 0), 7000);
  assert.equal(getPromoReturnStreakDiscountPercent(7), 95);
  assert.equal(getPromoReturnStreakDiscountPercent(0), 0);
});

test("mobile promo streak prices mirror web wiring on 4 services", () => {
  const hook = readMobile(
    "entities/promo-return-streak/model/useActivePromoReturnStreakDiscountPercent.ts",
  );
  const webHook = readClient(
    "entities/promo-return-streak/model/useActivePromoReturnStreakDiscountPercent.js",
  );
  const promotion = readMobile(
    "features/product-promotion/ui/ProductPromotionModal.tsx",
  );
  const webPromotion = readClient("entities/product/ui/ProductPromotionModal.jsx");
  const banner = readMobile(
    "features/advertising-page/ui/SiteHeaderBannerAdvertisingSection.tsx",
  );
  const category = readMobile(
    "features/advertising-page/ui/PersonalCategoryAdvertisingSection.tsx",
  );
  const raffle = readMobile(
    "features/advertising-page/ui/RaffleAdvertisingSection.tsx",
  );
  const raffleApi = readMobile("entities/raffle/api/fetchRaffleCreateAdvertising.ts");
  const bannerMut = readMobile(
    "entities/site-header-banner-campaign/model/useSiteHeaderBannerCampaignMutations.ts",
  );
  const categoryMut = readMobile(
    "entities/seller-personal-category/model/useSellerPersonalCategoryMutations.ts",
  );
  const unlockMut = readMobile(
    "entities/raffle/model/useUnlockRaffleCreateMutation.ts",
  );
  const copy = readMobile("shared/config/appUiCopy.ts");

  assert.match(hook, /claimedToday !== true/);
  assert.match(webHook, /claimedToday !== true/);

  assert.match(promotion, /applyPromoReturnStreakDiscount/);
  assert.match(promotion, /STREAK_DISCOUNT_BADGE/);
  assert.match(promotion, /chargeAmountRub/);
  assert.match(webPromotion, /applyPromoReturnStreakDiscount/);

  assert.match(banner, /applyPromoReturnStreakDiscount/);
  assert.match(banner, /было \$\{pricePointsList\}/);
  assert.match(banner, /loyaltyBalance < pricePoints/);

  assert.match(category, /applyPromoReturnStreakDiscount/);
  assert.match(category, /было \$\{listPricePoints\}/);
  assert.match(category, /loyaltyBalance < pricePoints/);

  assert.match(raffleApi, /listPricePoints/);
  assert.match(raffleApi, /discountPercent/);
  assert.match(raffle, /listPricePoints/);
  assert.match(raffle, /было \$\{listPricePoints\}/);
  assert.match(raffle, /loyaltyBalance < pricePoints/);

  assert.match(bannerMut, /invalidatePromoReturnStreak/);
  assert.match(categoryMut, /invalidatePromoReturnStreak/);
  assert.match(unlockMut, /invalidatePromoReturnStreak/);

  assert.match(copy, /STREAK_DISCOUNT_BADGE/);
  assert.match(copy, /STREAK_LIST_PRICE/);
});
