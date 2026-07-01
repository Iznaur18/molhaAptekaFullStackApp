import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

const LAYOUT = {
  fixedHeight: 430,
  bottomPadding: 7.2,
  bodyGap: 4,
  imageHeight: 273,
  headingHeight: 20,
  priceHeight: 21,
  metaHeight: 46,
  sellerRowHeight: 13.5,
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

const resolveImageHeight = (platformOs, layout = LAYOUT) => {
  if (platformOs !== "ios") {
    return layout.imageHeight;
  }

  return Math.round(
    layout.fixedHeight - layout.bottomPadding - resolveContentBelowImageHeight(layout),
  );
};

test("catalog-grid image height fills iOS card without bottom slack", () => {
  const imageHeight = resolveImageHeight("ios");
  const contentBelow = resolveContentBelowImageHeight(LAYOUT);
  const total = imageHeight + contentBelow + LAYOUT.bottomPadding;

  assert.equal(imageHeight, 306);
  assert.ok(Math.abs(total - LAYOUT.fixedHeight) < 1);
});

test("catalog-grid image height unchanged on web and android", () => {
  assert.equal(resolveImageHeight("web"), 273);
  assert.equal(resolveImageHeight("android"), 273);
});

test("catalogProductStyles uses platform-aware catalog-grid image height", () => {
  const source = readFileSync(
    join(REPO_ROOT, "mobile/shared/theme/catalogProductStyles.ts"),
    "utf8",
  );

  assert.match(source, /resolveProductCardCatalogGridImageHeight\(Platform\.OS\)/);
});
