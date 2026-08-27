import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import {
  PRODUCT_MEDIA_DISPLAY_ASPECT_RATIO,
  resolveProductMediaDisplayHeight,
} from "../../packages/design-tokens/src/productMedia.ts";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

const LAYOUT = {
  bottomPadding: 10,
  contentInsetX: 10,
  bodyGap: 4,
  headingHeight: 20,
  priceHeight: 21,
  metaHeight: 38,
  sellerRowHeight: 16,
};

const resolveContentBelowImageHeight = (layout) =>
  layout.bodyGap +
  layout.headingHeight +
  layout.bodyGap +
  layout.priceHeight +
  layout.bodyGap +
  layout.metaHeight +
  layout.bodyGap +
  layout.sellerRowHeight;

const resolveTotalHeight = (tileWidth, layout = LAYOUT) =>
  tileWidth + 2 * layout.contentInsetX + resolveContentBelowImageHeight(layout) + layout.bottomPadding;

test("product media display aspect ratio is square", () => {
  assert.equal(PRODUCT_MEDIA_DISPLAY_ASPECT_RATIO, 1);
  assert.equal(resolveProductMediaDisplayHeight(180), 180);
});

test("catalog-grid text stack height unchanged", () => {
  assert.equal(resolveContentBelowImageHeight(LAYOUT), 111);
});

test("catalog-grid total height follows tile width", () => {
  assert.equal(resolveTotalHeight(180), 321);
  assert.equal(resolveTotalHeight(238), 379);
});

test("catalogProductStyles uses shared product media aspect ratio for catalog grid", () => {
  const source = readFileSync(
    join(REPO_ROOT, "mobile/shared/theme/catalogProductStyles.ts"),
    "utf8",
  );

  assert.match(source, /PRODUCT_MEDIA_DISPLAY_ASPECT_RATIO/);
  assert.match(
    source,
    /imageWrapCatalogGrid:[\s\S]*marginHorizontal: -MCL\.contentInsetX/,
  );
  assert.match(
    source,
    /imageWrapCatalogGrid:[\s\S]*aspectRatio: PRODUCT_MEDIA_DISPLAY_ASPECT_RATIO/,
  );
  assert.match(source, /contentPressableCatalogGrid:[\s\S]*gap: MCL\.bodyGap/);
  assert.match(source, /cardRootCatalogGrid:[\s\S]*maxHeight: MCL\.priceHeight/);
  assert.match(source, /cardCurrentCatalogGrid:[\s\S]*lineHeight: MCL\.priceHeight/);
  assert.match(source, /contentCatalogGrid:[\s\S]*height: resolveProductCardCatalogGridContentBelowImageHeight/);
  assert.match(source, /contentPressableCatalogGrid:[\s\S]*alignItems: "flex-start"/);
  assert.match(source, /cardRootCatalogGrid:[\s\S]*flexDirection: "row"/);
  assert.doesNotMatch(source, /cardRootCatalogGrid:\s*\{[^}]*overflow:/);
});

test("ProductCard catalog-grid uses web mobile catalog spacing tokens", () => {
  const card = readFileSync(
    join(REPO_ROOT, "mobile/entities/product/ui/ProductCard.tsx"),
    "utf8",
  );
  const layout = readFileSync(
    join(REPO_ROOT, "mobile/entities/product/lib/productCardMobileCatalogLayout.ts"),
    "utf8",
  );
  const priceDisplay = readFileSync(
    join(REPO_ROOT, "mobile/entities/product/ui/ProductPriceDisplay.tsx"),
    "utf8",
  );

  assert.match(layout, /contentInsetX: 10/);
  assert.match(layout, /imageTopRadius: 15/);
  assert.match(layout, /priceColumnGap: 5\.6/);
  assert.match(layout, /resolveProductCardCatalogGridImageHeight/);
  assert.match(priceDisplay, /\[styles\.cardRoot, styles\.cardRootCatalogGrid\]/);
  assert.match(card, /catalogGridTileWidth/);
  assert.match(card, /resolveProductCardCatalogGridTotalHeight/);
  assert.match(card, /contentPressableCatalogGrid/);
  assert.match(card, /variant={isCatalogGrid \? "catalog-grid" : "card"}/);
  assert.match(card, /layout={isCatalogGrid \? "catalog-grid" : "default"}/);
});
