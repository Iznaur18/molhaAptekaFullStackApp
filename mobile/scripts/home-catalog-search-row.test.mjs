import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("HomeCatalogSearchRow: glass panel, header search, users", () => {
  const source = readMobileFile("features/home-feed/ui/HomeCatalogSearchRow.tsx");

  assert.doesNotMatch(source, /HomeCatalogBrandLogo/);
  assert.match(source, /HomeCatalogUsersButton/);
  assert.match(source, /HomeCatalogHeaderPanel/);
  assert.match(source, /HomeCatalogHeaderSearch/);
  assert.doesNotMatch(source, /CatalogSearchBar/);
  assert.doesNotMatch(source, /useAuthSessionQuery/);
});

test("home catalog header panel matches web mobile-split chrome", () => {
  const searchRow = readMobileFile("features/home-feed/ui/HomeCatalogSearchRow.tsx");
  const panel = readMobileFile("features/home-feed/ui/HomeCatalogHeaderPanel.tsx");
  const glass = readMobileFile("features/home-feed/ui/HomeCatalogHeaderGlassLayer.tsx");
  const styles = readMobileFile("shared/theme/homeCatalogHeaderStyles.ts");
  const layout = readMobileFile("shared/lib/homeCatalogHeaderLayout.ts");

  assert.match(panel, /HomeCatalogHeaderAccent/);
  assert.match(panel, /HomeCatalogHeaderGlassLayer/);
  assert.match(panel, /paddingTop/);
  assert.match(glass, /backdropFilter/);
  assert.match(glass, /resolveHomeCatalogHeaderGlassTint/);
  assert.match(styles, /bannerBelowPanel/);
  assert.match(layout, /HOME_CATALOG_HEADER_BANNER_BELOW_PANEL_MARGIN/);
  assert.doesNotMatch(searchRow, /SiteHeaderBannerSlot/);
  assert.match(styles, /backgroundColor: "transparent"/);
  assert.match(styles, /paddingHorizontal: HOME_CATALOG_HEADER_PANEL_PADDING\.horizontal/);
  assert.match(styles, /paddingBottom: HOME_CATALOG_HEADER_PANEL_PADDING\.bottom/);
  assert.match(styles, /HOME_CATALOG_HEADER_SEARCH_INPUT_MIN_HEIGHT/);
  // Full-bleed (категория): верх без радиуса. Overlay home: panelFloating.
  assert.match(styles, /borderTopLeftRadius: 0/);
  assert.match(styles, /borderBottomLeftRadius: HOME_CATALOG_HEADER_PANEL_RADIUS/);
  assert.match(styles, /panelFloating/);
  assert.match(styles, /MOBILE_BOTTOM_NAV_BORDER_RADIUS/);
  assert.match(searchRow, /floating=\{embeddedInForegroundSheet\}/);
  assert.match(searchRow, /resolveHomeCatalogHeaderPanelPaddingTop/);
  assert.match(layout, /HOME_CATALOG_HEADER_PANEL_TOP_GAP = 0/);
  assert.match(layout, /horizontal: HOME_CATALOG_HEADER_SHELL_HORIZONTAL_INSET/);
  assert.match(
    layout,
    /HOME_CATALOG_HEADER_CIRCLE_BUTTON_SIZE =\s*\n\s*HOME_CATALOG_HEADER_SEARCH_INPUT_MIN_HEIGHT/,
  );
  assert.doesNotMatch(searchRow, /marginHorizontal/);
  assert.match(layout, /HOME_CATALOG_HEADER_PANEL_BLUR_RADIUS = 18/);
  assert.match(layout, /HOME_CATALOG_HEADER_BOTTOM_MARGIN = 0/);
});

test("HomeCatalogStickySearchShell insets match bottom nav", () => {
  const shell = readMobileFile("features/home-feed/ui/HomeCatalogStickySearchShell.tsx");
  const layout = readMobileFile("shared/lib/homeCatalogHeaderLayout.ts");
  const index = readMobileFile("app/(tabs)/index.tsx");

  assert.match(shell, /resolveMobileBottomNavHorizontalInset/);
  assert.match(shell, /MOBILE_BOTTOM_NAV_FLOAT_OFFSET/);
  assert.match(shell, /resolveContentMaxWidth/);
  assert.match(shell, /paddingHorizontal: horizontalInset/);
  assert.match(shell, /barWrap/);
  assert.match(layout, /resolveHomeCatalogOverlayContentInsetTop/);
  assert.match(layout, /resolveHomeCatalogOverlaySearchPanelHeight/);
  assert.match(index, /resolveHomeCatalogOverlayContentInsetTop/);
  assert.match(index, /paddingTop: homeFeedOverlayInsetTop/);
});

test("HomeCatalogUsersButton opens stretch menu from circle", () => {
  const button = readMobileFile("features/home-feed/ui/HomeCatalogUsersButton.tsx");
  const menu = readMobileFile("features/home-feed/ui/HomeCatalogUsersStretchMenu.tsx");
  const animation = readMobileFile(
    "features/home-feed/model/useHomeCatalogUsersStretchMenuAnimation.ts",
  );
  const items = readMobileFile("features/home-feed/lib/buildHomeCatalogUsersMenuItems.ts");
  const layout = readMobileFile("shared/lib/homeCatalogHeaderLayout.ts");
  const styles = readMobileFile("shared/theme/homeCatalogHeaderStyles.ts");

  assert.match(button, /HomeCatalogUsersStretchMenu/);
  assert.match(button, /handleToggleMenu/);
  assert.doesNotMatch(button, /measureInWindow/);
  assert.doesNotMatch(button, /Modal/);
  assert.doesNotMatch(button, /onPress=\{\(\) => router\.push\("\/users"/);

  assert.match(menu, /usersStretchShell/);
  assert.match(menu, /name="grid-view"/);
  assert.match(menu, /accessibilityRole="menu"/);
  assert.match(menu, /MaterialIcons/);
  assert.match(menu, /accessibilityLabel=\{item\.accessibilityLabel\}/);

  assert.match(animation, /portalVisible/);
  assert.match(animation, /HOME_CATALOG_HEADER_USERS_STRETCH_ANIMATION_MS/);
  assert.match(menu, /visible=\{portalVisible\}/);
  assert.match(menu, /isMenuExpanded/);

  assert.match(layout, /HOME_CATALOG_HEADER_USERS_STRETCH_TOGGLE_GAP/);
  assert.match(styles, /marginTop: HOME_CATALOG_HEADER_USERS_STRETCH_TOGGLE_GAP/);
  assert.match(styles, /usersStretchShell/);
  assert.match(menu, /Modal/);
  assert.match(menu, /measureInWindow/);
  assert.match(menu, /resolveHomeCatalogUsersMenuPortalStyle/);
  assert.match(layout, /resolveHomeCatalogUsersMenuPortalTop/);
  assert.match(menu, /embeddedInForegroundSheet/);
  assert.match(menu, /useStickyAnchorFallback/);

  assert.match(items, /icon: "people"/);
  assert.match(items, /key: "terms"/);
  assert.match(items, /href: "\/legal\/terms"/);
  assert.match(items, /icon: "article"/);
  assert.match(items, /MENU_ITEM_TERMS_ARIA/);
  assert.match(items, /key: "faq"/);
  assert.match(items, /href: "\/faq"/);
  assert.match(items, /icon: "quiz"/);
  assert.match(items, /MENU_ITEM_FAQ_ARIA/);
  assert.match(items, /key: "notifications"/);
  assert.match(items, /href: "\/notifications"/);
  assert.match(items, /icon: "notifications"/);
  assert.match(items, /MENU_ITEM_NOTIFICATIONS_ARIA/);
});
