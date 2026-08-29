import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const MOBILE_ROOT = join(REPO_ROOT, "mobile");
const CLIENT_ROOT = join(REPO_ROOT, "client");

const readMobile = (path) => readFileSync(join(MOBILE_ROOT, path), "utf8");
const readClient = (path) => readFileSync(join(CLIENT_ROOT, path), "utf8");

test("promotion corner ribbon layout matches web ProductCardMedia.css tokens", () => {
  const layout = readMobile("entities/product/lib/productCardPromotionRibbonLayout.ts");
  const flag = readMobile("entities/product/ui/ProductCardPromotionCornerFlag.tsx");
  const mediaCss = readClient(
    "src/entities/product/ui/product-card/ProductCardMedia.css",
  );

  assert.match(layout, /paddingTop: 4\.48/);
  assert.match(layout, /paddingRight: 11\.2/);
  assert.match(layout, /borderBottomRightRadius: 12/);
  assert.match(layout, /fontSize: 10\.88/);
  assert.match(layout, /gradientMixRatio: 0\.78/);
  assert.match(layout, /resolveProductCardPromotionRibbonGradient/);
  assert.match(flag, /PRODUCT_CARD_PROMOTION_RIBBON_LAYOUT/);
  assert.match(flag, /resolveProductCardPromotionRibbonGradient/);
  assert.match(flag, /left: insetLeft/);
  assert.doesNotMatch(flag, /getProductPromotionTierChrome/);
  assert.match(mediaCss, /\.product-card__promotion-ribbon--tier-1/);
  assert.match(mediaCss, /border-bottom-right-radius: 0\.75rem/);
  assert.match(mediaCss, /font-size: 0\.68rem/);
});

test("ProductCard shows promotion ribbon from badge flags like web ProductCardMedia", () => {
  const card = readMobile("entities/product/ui/ProductCard.tsx");
  const media = readClient("src/entities/product/ui/product-card/ProductCardMedia.jsx");

  assert.match(card, /promotionRibbonTier/);
  assert.match(card, /showPromotionBoostBadge/);
  assert.match(card, /ProductCardPromotionCornerFlag[\s\S]*tier=\{promotionRibbonTier\}/);
  assert.match(card, /insetLeft=\{imageOverlayInsetX\}/);
  assert.match(card, /resolveProductCardImageOverlayInsetX/);
  assert.match(media, /showPromotionBoostBadge/);
  assert.match(media, /product-card__promotion-ribbon/);
});
