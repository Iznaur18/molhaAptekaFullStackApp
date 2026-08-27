import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT_ROOT = join(MOBILE_ROOT, "..", "client");

const readFile = (root, relativePath) =>
  readFileSync(join(root, relativePath), "utf8");

test("product details feature cards match web chrome and lucide icons", () => {
  const layout = readFile(
    MOBILE_ROOT,
    "entities/product/lib/productDetailsFeatureCardLayout.ts",
  );
  const card = readFile(MOBILE_ROOT, "entities/product/ui/ProductDetailsFeatureCard.tsx");
  const compare = readFile(
    MOBILE_ROOT,
    "features/product-detail/ui/ProductDetailsCompareTeaser.tsx",
  );
  const detailsTab = readFile(
    MOBILE_ROOT,
    "features/product-detail/ui/ProductDetailsDetailsTab.tsx",
  );
  const webPriceCss = readFile(
    CLIENT_ROOT,
    "src/entities/product/ui/product-details-modal/ProductDetailsModalPrice.css",
  );
  const styles = readFile(MOBILE_ROOT, "shared/theme/catalogProductStyles.ts");
  const webCss = readFile(
    CLIENT_ROOT,
    "src/entities/product/ui/product-details-modal/ProductDetailsFeatureCard.css",
  );
  const webCompare = readFile(
    CLIENT_ROOT,
    "src/entities/product/ui/product-details-modal/ProductDetailsCompareTeaser.jsx",
  );

  assert.match(layout, /cardBorderRadius: 14/);
  assert.match(layout, /iconSize: 44/);
  assert.match(layout, /chevronSize: 18/);
  assert.match(card, /ChevronRight/);
  assert.match(card, /useProductDetailsFeatureCardStyles/);
  assert.match(card, /cardPressed/);
  assert.match(compare, /GitCompareArrows/);
  assert.match(compare, /productDetailsLucideIcons/);
  assert.match(compare, /ProductDetailsFeatureCard/);
  assert.match(styles, /useProductDetailsFeatureCardStyles/);
  assert.match(webCss, /border-radius: 0\.875rem/);
  assert.match(webCss, /width: 2\.75rem/);
  assert.match(webCompare, /GitCompareArrows/);
  assert.match(webPriceCss, /\.product-details-modal__feature-cards/);
  assert.match(webPriceCss, /padding: 12px/);
  assert.match(detailsTab, /styles\.featureCards/);
  assert.match(detailsTab, /ProductDetailsCompareTeaser/);
  assert.match(detailsTab, /ProductDetailsQaTeaser/);
});
