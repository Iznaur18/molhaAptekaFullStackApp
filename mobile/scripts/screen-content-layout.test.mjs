import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT_ROOT = join(MOBILE_ROOT, "..", "client");

const readFile = (root, relativePath) =>
  readFileSync(join(root, relativePath), "utf8");

const SCREEN_CONTENT_PADDING_HORIZONTAL = 16;
const SCREEN_CONTENT_PADDING_BOTTOM = 18;

const resolveScreenContentPaddingHorizontal = (insets = {}) =>
  Math.max(
    SCREEN_CONTENT_PADDING_HORIZONTAL,
    insets.left ?? 0,
    insets.right ?? 0,
  );

test("mobile content padding constants increased for edge safety", () => {
  const source = readFile(MOBILE_ROOT, "shared/theme/screenContentLayout.ts");

  assert.match(source, /SCREEN_CONTENT_PADDING_HORIZONTAL = 16/);
  assert.match(source, /SCREEN_CONTENT_PADDING_BOTTOM = 18/);
  assert.match(source, /resolveScreenContentPaddingBottom/);
  assert.match(source, /resolveScreenContentPaddingHorizontal/);
});

test("resolveScreenContentPaddingHorizontal respects safe area", () => {
  assert.equal(resolveScreenContentPaddingHorizontal(), 16);
  assert.equal(resolveScreenContentPaddingHorizontal({ left: 0, right: 0 }), 16);
  assert.equal(resolveScreenContentPaddingHorizontal({ left: 20, right: 0 }), 20);
});

test("web mobile shell uses safe inline padding token", () => {
  const appShellCss = readFile(CLIENT_ROOT, "src/app/ui/AppShell.css");

  assert.match(appShellCss, /--app-shell-content-inline-padding/);
  assert.match(appShellCss, /safe-area-inset-left/);
  assert.match(appShellCss, /max\(\s*0\.75rem/);
});

test("web mobile bottom nav uses horizontal safe area and rounded edges", () => {
  const navCss = readFile(
    CLIENT_ROOT,
    "src/widgets/mobile-bottom-nav/ui/MobileBottomNav.css",
  );

  assert.match(navCss, /safe-area-inset-left/);
  assert.match(navCss, /safe-area-inset-right/);
  assert.match(navCss, /border-radius:\s*var\(--iz-radius-pill\)/);
  assert.match(navCss, /--mobile-bottom-nav-horizontal-inset/);
});

test("mobile bottom nav uses floating liquid-glass pill (web parity)", () => {
  const source = readFile(MOBILE_ROOT, "shared/lib/mobileBottomNavLayout.ts");
  const tabBar = readFile(MOBILE_ROOT, "shared/ui/MobileBottomTabBar.tsx");
  const tabsLayout = readFile(MOBILE_ROOT, "app/(tabs)/_layout.tsx");
  const cartScreen = readFile(MOBILE_ROOT, "app/(tabs)/cart.tsx");
  const contentLayout = readFile(MOBILE_ROOT, "shared/theme/screenContentLayout.ts");

  assert.match(source, /MOBILE_BOTTOM_NAV_HORIZONTAL_INSET = 12/);
  assert.match(source, /MOBILE_BOTTOM_NAV_FLOAT_OFFSET = 6/);
  assert.match(source, /MOBILE_BOTTOM_NAV_MIN_EDGE_GAP/);
  assert.match(source, /resolveMobileBottomNavPaddingBottom/);
  assert.match(source, /MOBILE_BOTTOM_NAV_BORDER_RADIUS = 999/);
  assert.match(source, /resolveMobileBottomNavLayoutHeight/);
  assert.match(source, /resolveMobileBottomNavOverlayContentInset/);
  assert.match(tabBar, /resolveMobileBottomNavHorizontalInset/);
  assert.match(tabBar, /resolveMobileBottomNavPaddingBottom/);
  assert.match(tabBar, /MOBILE_BOTTOM_NAV_PADDING_VERTICAL/);
  assert.match(tabBar, /liquidOverlay/);
  assert.match(tabBar, /liquidSheen/);
  assert.match(tabBar, /resolveContentMaxWidth/);
  assert.match(tabBar, /pointerEvents: "box-none"/);
  assert.match(tabsLayout, /safeAreaInsets:\s*\{\s*bottom:\s*0\s*\}/);
  assert.match(tabsLayout, /position:\s*"absolute"/);
  assert.match(tabsLayout, /height:\s*0/);
  assert.match(tabBar, /position:\s*"absolute"/);
  assert.match(contentLayout, /resolveMobileBottomNavOverlayContentInset/);
  assert.match(cartScreen, /resolveMobileBottomNavLayoutHeight/);
  assert.match(tabBar, /itemActive[\s\S]*backgroundColor: withAlpha/);
});

test("resolveMobileBottomNavLayoutHeight matches floating pill chrome", () => {
  const source = readFile(MOBILE_ROOT, "shared/lib/mobileBottomNavLayout.ts");

  assert.match(source, /resolveMobileBottomNavPaddingBottom/);
  assert.match(source, /MOBILE_BOTTOM_NAV_MIN_EDGE_GAP/);
  assert.match(source, /resolveMobileBottomNavPillHeight/);
  assert.match(source, /Math\.max\(safeAreaBottom, MOBILE_BOTTOM_NAV_MIN_EDGE_GAP\)/);
});
