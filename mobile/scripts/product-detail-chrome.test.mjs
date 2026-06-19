import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT_ROOT = join(MOBILE_ROOT, "..", "client");

const readFile = (root, relativePath) =>
  readFileSync(join(root, relativePath), "utf8");

test("web mobile bottom nav hidden while product details modal is open", () => {
  const navCss = readFile(
    CLIENT_ROOT,
    "src/widgets/mobile-bottom-nav/ui/MobileBottomNav.css",
  );

  assert.match(navCss, /body:has\(\.product-details-modal\)\s+\.mobile-bottom-nav/);
  assert.match(navCss, /display:\s*none/);
});

test("web product details modal uses full viewport and dock without nav offset", () => {
  const mobileCss = readFile(
    CLIENT_ROOT,
    "src/entities/product/ui/product-details-modal/ProductDetailsModalMobile.css",
  );
  const tokensCss = readFile(
    CLIENT_ROOT,
    "src/entities/product/ui/product-details-modal/productDetailsModalTokens.css",
  );

  assert.match(mobileCss, /\.product-modal-shell__backdrop:has\(\.product-details-modal\)[\s\S]*inset:\s*0/);
  assert.doesNotMatch(
    mobileCss,
    /product-details-modal[\s\S]*--app-shell-mobile-bottom-nav-height/,
  );
  assert.match(
    mobileCss,
    /\.product-modal-shell__docked-footer[\s\S]*bottom:\s*env\(safe-area-inset-bottom/,
  );
  assert.doesNotMatch(tokensCss, /--app-shell-mobile-bottom-nav-height/);
  assert.match(tokensCss, /--product-details-modal-mobile-dock-max-height/);
});

test("mobile product detail screen is outside tabs and uses dock-only scroll padding", () => {
  const rootLayout = readFile(MOBILE_ROOT, "app/_layout.tsx");
  const layoutLib = readFile(MOBILE_ROOT, "shared/lib/productDetailScreenLayout.ts");
  const styles = readFile(MOBILE_ROOT, "shared/theme/catalogProductStyles.ts");
  const tabLayout = readFile(MOBILE_ROOT, "app/(tabs)/_layout.tsx");

  assert.match(rootLayout, /name="product\/\[id\]"/);
  assert.doesNotMatch(tabLayout, /product\/\[id\]/);
  assert.match(layoutLib, /PRODUCT_DETAIL_DOCK_SCROLL_PADDING = 88/);
  assert.match(styles, /PRODUCT_DETAIL_DOCK_SCROLL_PADDING/);
  assert.doesNotMatch(styles, /DETAIL_DOCK_SCROLL_PADDING = 124/);
});
