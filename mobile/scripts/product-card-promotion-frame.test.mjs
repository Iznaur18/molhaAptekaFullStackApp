import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("promotion frame palette mirrors web tier accents", () => {
  const palette = readMobileFile("entities/product/lib/productCardPromotionFramePalette.ts");

  assert.match(palette, /resolveProductCardPromotionCompactFrame/);
  assert.match(palette, /resolveProductCardPromotionBannerInnerFrame/);
  assert.match(palette, /PRODUCT_CARD_PROMOTION_TIER\.GOLD/);
  assert.match(palette, /PRODUCT_CARD_PROMOTION_BANNER_INNER_FRAME/);
});

test("ProductCard applies compact promotion gradient frame", () => {
  const card = readMobileFile("entities/product/ui/ProductCard.tsx");
  const background = readMobileFile("entities/product/ui/ProductCardPromotionBackground.tsx");

  assert.match(card, /showPromotionChrome/);
  assert.match(card, /variant="compact"/);
  assert.match(background, /resolveProductCardPromotionCompactFrame/);
});
