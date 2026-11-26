import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT_ROOT = join(MOBILE_ROOT, "..", "client");

const readMobile = (p) => readFileSync(join(MOBILE_ROOT, p), "utf8");
const readClient = (p) => readFileSync(join(CLIENT_ROOT, "src", p), "utf8");

test("product details price old + gaps match web page/modal", () => {
  const palette = readMobile("entities/product/lib/productCardBadgePalette.ts");
  const styles = readMobile("shared/theme/catalogProductStyles.ts");
  const webPage = readClient("pages/product-details/ui/ProductDetailsPage.css");
  const webMobile = readClient(
    "entities/product/ui/product-details-modal/ProductDetailsModalMobile.css",
  );

  assert.match(webPage, /gap:\s*0\.35rem 0\.55rem/);
  assert.match(
    webPage,
    /product-price-display__old[\s\S]*color-mix\(in srgb, currentColor 45%, transparent\)/,
  );
  assert.match(webMobile, /gap:\s*0\.35rem 0\.55rem/);
  assert.match(
    webMobile,
    /product-price-display__old[\s\S]*color-mix\(in srgb, currentColor 45%, transparent\)/,
  );

  assert.match(palette, /resolveProductDetailPriceOldColor/);
  assert.match(palette, /mixHexColors\(c\.action, c\.surface, 0\.45\)/);
  assert.match(styles, /resolveProductDetailPriceOldColor\(theme\.colors\)/);
  assert.match(styles, /detailRoot:[\s\S]*rowGap: 5\.6/);
  assert.match(styles, /detailRoot:[\s\S]*columnGap: 8\.8/);
  assert.match(styles, /detailCurrent:[\s\S]*fontSize: 29\.6/);
  assert.match(styles, /detailCurrent:[\s\S]*letterSpacing: -0\.9/);
});

test("product details page enter/exit timings match web CSS vars", () => {
  const anim = readMobile(
    "features/product-detail/lib/productDetailsPageEnterAnimation.ts",
  );
  const shell = readMobile(
    "features/product-detail/ui/ProductDetailsPageEnterShell.tsx",
  );
  const screen = readMobile("app/product/[id].tsx");
  const webPage = readClient("pages/product-details/ui/ProductDetailsPage.css");

  assert.match(webPage, /--product-details-page-enter-ms:\s*220ms/);
  assert.match(webPage, /--product-details-page-exit-ms:\s*180ms/);
  assert.match(webPage, /scale\(0\.96\)/);
  assert.match(anim, /PRODUCT_DETAILS_PAGE_ENTER_MS = 220/);
  assert.match(anim, /PRODUCT_DETAILS_PAGE_EXIT_MS = 180/);
  assert.match(anim, /PRODUCT_DETAILS_PAGE_ENTER_SCALE = 0\.96/);
  assert.match(shell, /createProductDetailsPageEntering/);
  assert.match(shell, /createProductDetailsPageExiting/);
  assert.match(screen, /ProductDetailsPageEnterShell/);
});

test("product details tabs + blocked purchase + stack shows bottom nav overlay", () => {
  const tabs = readMobile("entities/product/model/useProductDetailTabs.ts");
  const purchase = readMobile(
    "features/product-detail/ui/ProductDetailPurchaseActions.tsx",
  );
  const layout = readMobile("app/_layout.tsx");
  const tabsLayout = readMobile("app/(tabs)/_layout.tsx");
  const screen = readMobile("app/product/[id].tsx");
  const skeleton = readMobile("features/product-detail/ui/ProductDetailsSkeleton.tsx");
  const screenLayout = readMobile("shared/lib/productDetailScreenLayout.ts");

  assert.match(tabs, /"details"/);
  assert.match(tabs, /"reviews"/);
  assert.match(tabs, /"qa"/);
  assert.match(tabs, /"similar"/);
  assert.match(tabs, /"compare"/);
  assert.match(tabs, /"auction"/);
  assert.match(tabs, /"installment"/);
  assert.match(purchase, /BlockedPurchaseButton/);
  assert.match(layout, /name="product\/\[id\]"/);
  assert.match(tabsLayout, /MobileBottomTabBar/);
  assert.match(screen, /MobileBottomNavOverlay/);
  assert.match(screen, /resolveMobileBottomNavLayoutHeight/);
  assert.match(screen, /dockBottomStyle/);
  assert.match(skeleton, /resolveMobileBottomNavLayoutHeight/);
  assert.match(screenLayout, /navOverlayInset/);
  assert.match(screenLayout, /dockSafe/);
});
