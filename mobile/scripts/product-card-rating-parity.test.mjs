import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

const readMobileFile = (relativePath) =>
  readFileSync(join(REPO_ROOT, "mobile", relativePath), "utf8");

const readClientFile = (relativePath) =>
  readFileSync(join(REPO_ROOT, "client", relativePath), "utf8");

test("product card rating row matches web structure and colors", () => {
  const webCss = readClientFile("src/entities/product/ui/product-card/ProductCardBadges.css");
  const webContent = readClientFile(
    "src/entities/product/ui/product-card/ProductCardStandardContent.jsx",
  );
  const ratingRow = readMobileFile("entities/product/ui/ProductCardRatingRow.tsx");
  const palette = readMobileFile("entities/product/lib/productCardBadgePalette.ts");
  const card = readMobileFile("entities/product/ui/ProductCard.tsx");

  assert.match(webCss, /product-card__rating[\s\S]*color:\s*var\(--iz-color-text-muted\)/);
  assert.match(webContent, /product-card__rating-score/);
  assert.match(webContent, /MessageSquare/);
  assert.match(webContent, /reviewRatingParts\.count/);

  assert.match(ratingRow, /chat-bubble/);
  assert.match(ratingRow, /★ \{parts\.rating\}/);
  assert.match(ratingRow, /formatProductReviewRatingLine/);
  assert.match(palette, /rating: c\.textMuted/);
  assert.match(card, /ProductCardRatingRow/);
  assert.doesNotMatch(card, /formatProductReviewRatingLine/);
});
