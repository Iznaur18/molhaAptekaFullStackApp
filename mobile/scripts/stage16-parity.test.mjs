import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PKG = join(ROOT, "../packages/design-tokens/src");
const CLIENT = join(ROOT, "../client/src");

const readMobile = (p) => readFileSync(join(ROOT, p), "utf8");
const readPkg = (p) => readFileSync(join(PKG, p), "utf8");
const readClient = (p) => readFileSync(join(CLIENT, p), "utf8");

test("16.1 press spring = izInteraction / --iz-transition-press 180ms", () => {
  const interaction = readPkg("interaction.ts");
  const webCss = readClient("shared/styles/designTokens.css");
  const appButton = readMobile("shared/ui/AppButton.tsx");
  const pressableScale = readMobile("shared/ui/PressableScale.tsx");
  const addToCart = readMobile("features/cart-add/ui/AddToCartButton.tsx");
  const wishlistToggle = readMobile(
    "features/wishlist-toggle/ui/WishlistToggleButton.tsx",
  );

  assert.match(interaction, /transitionPressMs:\s*180/);
  assert.match(interaction, /pressedScale:\s*0\.96/);
  assert.match(interaction, /pressSpringDamping:\s*18/);
  assert.match(interaction, /pressSpringStiffness:\s*350/);
  assert.match(webCss, /--iz-transition-press:\s*180ms/);

  assert.match(appButton, /withSpring\(izInteraction\.pressedScale/);
  assert.match(pressableScale, /withSpring\(izInteraction\.pressedScale/);
  assert.match(pressableScale, /pressSpringDamping/);
  assert.match(addToCart, /PressableScale/);
  assert.doesNotMatch(addToCart, /<(?!\/)Pressable(?!Scale)[\s>]/);
  assert.match(wishlistToggle, /PressableScale/);
});

test("16.2 ThemedRefreshControl tint = theme.colors.action", () => {
  const refresh = readMobile("shared/ui/ThemedRefreshControl.tsx");
  const catalog = readMobile("features/catalog-browser/ui/CatalogBrowserPage.tsx");
  const cart = readMobile("app/(tabs)/cart.tsx");
  const home = readMobile("app/(tabs)/index.tsx");

  assert.match(refresh, /theme\.colors\.action/);
  assert.match(refresh, /tintColor=\{tint\}/);
  assert.match(catalog, /ThemedRefreshControl/);
  assert.match(cart, /ThemedRefreshControl/);
  assert.match(home, /ThemedRefreshControl/);
});

test("16.3 buyer-critical load/error/empty/guest", () => {
  const dod = readMobile("docs/BUYER-CRITICAL-PATH.md");
  const catalog = readMobile("features/catalog-browser/ui/CatalogBrowserPage.tsx");
  const notifications = readMobile(
    "features/notifications-page/ui/NotificationsPage.tsx",
  );
  const wishlist = readMobile("features/wishlist-page/ui/WishlistPage.tsx");
  const orders = readMobile("features/my-orders-page/ui/MyOrdersPage.tsx");
  const cart = readMobile("app/(tabs)/cart.tsx");
  const copy = readMobile("shared/config/appUiCopy.ts");

  assert.match(dod, /ScreenLoadingState/);
  assert.match(dod, /ScreenErrorState/);
  assert.match(dod, /PressableScale/);
  assert.match(dod, /ThemedRefreshControl/);
  assert.match(dod, /skeleton/i);

  assert.match(catalog, /ScreenLoadingState/);
  assert.match(catalog, /ScreenErrorState/);
  assert.match(catalog, /CATALOG_BROWSER_UI\.EMPTY/);
  assert.match(catalog, /EMPTY_GO_HOME/);
  assert.match(copy, /EMPTY:\s*"Подборки и категории пока недоступны/);

  assert.match(notifications, /ScreenErrorState/);
  assert.match(notifications, /AppButton/);
  assert.match(notifications, /reportClientIssue/);
  assert.match(wishlist, /AppButton/);
  assert.match(orders, /EMPTY_GO_CATALOG/);
  assert.match(orders, /AppButton/);
  assert.match(cart, /ScreenLoadingState|ScreenErrorState|AUTH_REQUIRED/);
});

test("16.4 no silent catch on notifications mark-read", () => {
  const page = readMobile("features/notifications-page/ui/NotificationsPage.tsx");
  const hook = readMobile(
    "entities/notification/model/useMarkInAppNotificationsReadOnView.ts",
  );

  assert.match(page, /reportClientIssue\("NotificationsPage#markReadOnBlur"/);
  assert.match(hook, /reportClientIssue\("useMarkInAppNotificationsReadOnView"/);
  assert.doesNotMatch(page, /\.catch\(\(\)\s*=>\s*\{/);
  assert.doesNotMatch(hook, /\.catch\(\(\)\s*=>\s*\{/);
});
