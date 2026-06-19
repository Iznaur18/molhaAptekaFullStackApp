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

  assert.match(palette, /rgba\(217, 119, 6, 0\.68\)/);
  assert.match(palette, /rgba\(124, 58, 237, 0\.78\)/);
  assert.match(palette, /rgba\(220, 38, 38, 0\.72\)/);
  assert.match(palette, /PRODUCT_CARD_PROMOTION_BANNER_INNER_FRAME/);
});

test("ProductCard applies compact promotion gradient frame", () => {
  const card = readMobileFile("entities/product/ui/ProductCard.tsx");
  const background = readMobileFile("entities/product/ui/ProductCardPromotionBackground.tsx");

  assert.match(card, /showPromotionChrome/);
  assert.match(card, /variant="compact"/);
  assert.match(background, /PRODUCT_CARD_PROMOTION_COMPACT_FRAME/);
});
