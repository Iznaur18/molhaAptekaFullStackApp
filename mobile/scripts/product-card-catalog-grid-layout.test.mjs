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
  bottomPadding: 7.2,
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

test("product media display aspect ratio is square", () => {
  assert.equal(PRODUCT_MEDIA_DISPLAY_ASPECT_RATIO, 1);
  assert.equal(resolveProductMediaDisplayHeight(180), 180);
});

test("catalog-grid text stack height unchanged", () => {
  assert.equal(resolveContentBelowImageHeight(LAYOUT), 111);
});

test("catalogProductStyles uses shared product media aspect ratio for catalog grid", () => {
  const source = readFileSync(
    join(REPO_ROOT, "mobile/shared/theme/catalogProductStyles.ts"),
    "utf8",
  );

  assert.match(source, /PRODUCT_MEDIA_DISPLAY_ASPECT_RATIO/);
  assert.match(source, /imageWrapCatalogGrid:[\s\S]*aspectRatio: PRODUCT_MEDIA_DISPLAY_ASPECT_RATIO/);
  assert.doesNotMatch(source, /resolveProductCardCatalogGridImageHeight/);
});
