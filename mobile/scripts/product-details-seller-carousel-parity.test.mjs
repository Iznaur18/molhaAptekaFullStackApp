import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT_ROOT = join(MOBILE_ROOT, "..", "client");

const readFile = (root, relativePath) =>
  readFileSync(join(root, relativePath), "utf8");

test("seller products carousel matches web chrome and layout", () => {
  const layout = readFile(
    MOBILE_ROOT,
    "entities/product/lib/productDetailsSellerProductsCarouselLayout.ts",
  );
  const chrome = readFile(MOBILE_ROOT, "shared/theme/profileChromeStyles.ts");
  const section = readFile(MOBILE_ROOT, "entities/user/ui/UserProfileThumbSection.tsx");
  const detailsTab = readFile(
    MOBILE_ROOT,
    "features/product-detail/ui/ProductDetailsDetailsTab.tsx",
  );
  const webCss = readFile(
    CLIENT_ROOT,
    "src/entities/product/ui/product-details-modal/ProductDetailsSellerProductsCarousel.css",
  );

  assert.match(layout, /borderRadius: 16/);
  assert.match(layout, /thumbSize: 64/);
  assert.match(layout, /thumbRadius: 18/);
  assert.match(layout, /trackGap: 10/);
  assert.match(layout, /headingFontSize: 13/);
  assert.match(chrome, /PRODUCT_DETAILS_SELLER_PRODUCTS_CAROUSEL_LAYOUT as SPC/);
  assert.match(chrome, /headerHorizontal:/);
  assert.match(chrome, /scrollRowContent:/);
  assert.match(chrome, /thumbClipCurrent:/);
  assert.match(section, /isCurrent/);
  assert.match(section, /currentProductId/);
  assert.match(detailsTab, /currentProductId=\{productId\}/);
  assert.match(webCss, /border-radius: 1rem/);
  assert.match(webCss, /width: 64px/);
  assert.match(webCss, /border-radius: 18px/);
  assert.match(webCss, /gap: 10px/);
});
