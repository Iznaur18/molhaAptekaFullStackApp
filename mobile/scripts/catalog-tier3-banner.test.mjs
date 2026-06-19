import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import {
  interleaveCatalogTier3Banners,
  shouldShowProductTier3BannerFullWidth,
} from "../../packages/shared-lib/dist/index.js";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

const futureExpiry = () => new Date(Date.now() + 86_400_000).toISOString();

const tier3Product = (id) => ({
  _id: id,
  catalogPromotionTier: 3,
  catalogPromotionExpiresAt: futureExpiry(),
  catalogPromotionActivatedAt: "2026-01-01T00:00:00.000Z",
});

const regularProduct = (id) => ({ _id: id });

test("catalog tier3 banners enabled only on home main view", () => {
  const source = readMobileFile("features/catalog-grid/lib/shouldShowCatalogTier3Banners.ts");

  assert.match(source, /showHomeFeed/);
  assert.match(source, /!isMineMode && showHomeFeed/);
});

test("interleave + full-width gate matches web catalog feed", () => {
  const products = [
    ...Array.from({ length: 6 }, (_, index) => regularProduct(`r${index + 1}`)),
    tier3Product("b1"),
  ];

  const interleaved = interleaveCatalogTier3Banners(products, 2, { enabled: true });
  const banner = interleaved.find((item) =>
    shouldShowProductTier3BannerFullWidth(item, { showFullWidthTier3Banners: true }),
  );

  assert.equal(banner?._id, "b1");
});

test("catalog screen wires tier3 banner grid rows", () => {
  const source = readMobileFile("app/(tabs)/index.tsx");
  const layout = readMobileFile("features/catalog-grid/lib/catalogGridLayout.ts");

  assert.match(source, /buildCatalogGridRows/);
  assert.match(source, /shouldShowCatalogTier3Banners/);
  assert.match(source, /CatalogGridRowItem/);
  assert.match(source, /resolveCatalogGridListContentStyle/);
  assert.match(source, /numColumns=\{1\}/);
  assert.match(layout, /PRODUCT_GRID_GAP/);
});

test("ProductCardBanner mirrors web banner chrome", () => {
  const bannerSource = readMobileFile("entities/product/ui/ProductCardBanner.tsx");
  const flagsSource = readMobileFile("entities/product/lib/useProductCardChromeFlags.ts");
  const palette = readMobileFile("entities/product/lib/productCardPromotionFramePalette.ts");
  const cardSource = readMobileFile("entities/product/ui/ProductCard.tsx");

  assert.match(bannerSource, /PROMOTION_BANNER_BADGE/);
  assert.match(bannerSource, /ProductCardPromotionBackground/);
  assert.match(bannerSource, /banner-inner/);
  assert.match(flagsSource, /showPromotionChrome/);
  assert.match(flagsSource, /showBannerLayout/);
  assert.match(palette, /PRODUCT_CARD_PROMOTION_COMPACT_FRAME/);
  assert.match(cardSource, /ProductCardPromotionBackground/);
  assert.match(cardSource, /resolveProductCardPromotionFrameStyle/);
});

test("buildCatalogGridRows splits interleaved feed into flat list rows", () => {
  const source = readMobileFile("features/catalog-grid/lib/buildCatalogGridRows.ts");

  assert.match(source, /interleaveCatalogTier3Banners/);
  assert.match(source, /kind: "tier3-banner"/);
  assert.match(source, /kind: "product-cells"/);
});
