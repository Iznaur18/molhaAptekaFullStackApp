import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT_ROOT = join(MOBILE_ROOT, "..", "client");

const readFile = (root, relativePath) =>
  readFileSync(join(root, relativePath), "utf8");

const SCREEN_CONTENT_PADDING_HORIZONTAL = 14;
const SCREEN_CONTENT_PADDING_BOTTOM = 18;

const resolveScreenContentPaddingHorizontal = (insets = {}) =>
  Math.max(
    SCREEN_CONTENT_PADDING_HORIZONTAL,
    insets.left ?? 0,
    insets.right ?? 0,
  );

test("mobile content padding constants increased for edge safety", () => {
  const source = readFile(MOBILE_ROOT, "shared/theme/screenContentLayout.ts");

  assert.match(source, /SCREEN_CONTENT_PADDING_HORIZONTAL = 14/);
  assert.match(source, /SCREEN_CONTENT_PADDING_BOTTOM = 18/);
  assert.match(source, /resolveScreenContentPaddingHorizontal/);
});

test("resolveScreenContentPaddingHorizontal respects safe area", () => {
  assert.equal(resolveScreenContentPaddingHorizontal(), 14);
  assert.equal(resolveScreenContentPaddingHorizontal({ left: 0, right: 0 }), 14);
  assert.equal(resolveScreenContentPaddingHorizontal({ left: 20, right: 0 }), 20);
});

test("web mobile shell uses safe inline padding token", () => {
  const appShellCss = readFile(CLIENT_ROOT, "src/app/ui/AppShell.css");

  assert.match(appShellCss, /--app-shell-content-inline-padding/);
  assert.match(appShellCss, /safe-area-inset-left/);
  assert.match(appShellCss, /max\(\s*1rem/);
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

test("mobile bottom nav layout matches web inset constants", () => {
  const source = readFile(MOBILE_ROOT, "shared/lib/mobileBottomNavLayout.ts");
  const tabBar = readFile(MOBILE_ROOT, "shared/ui/MobileBottomTabBar.tsx");

  assert.match(source, /MOBILE_BOTTOM_NAV_HORIZONTAL_INSET = 12/);
  assert.match(source, /MOBILE_BOTTOM_NAV_FLOAT_OFFSET = 10/);
  assert.match(tabBar, /resolveMobileBottomNavHorizontalInset/);
  assert.match(tabBar, /theme\.radius\.pill/);
  assert.match(tabBar, /itemActive[\s\S]*`\$\{theme\.colors\.action\}1A`/);
});
