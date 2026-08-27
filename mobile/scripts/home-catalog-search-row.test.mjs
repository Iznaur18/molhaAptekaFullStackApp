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
  assert.match(source, /ViewerRegionSelect/);
  assert.match(source, /authActions/);
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
  const region = readMobileFile("entities/region/ui/ViewerRegionSelect.tsx");

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
  assert.match(styles, /borderTopLeftRadius: 0/);
  assert.match(styles, /borderBottomLeftRadius: HOME_CATALOG_HEADER_PANEL_RADIUS/);
  assert.match(styles, /panelFloating/);
  assert.match(styles, /MOBILE_BOTTOM_NAV_BORDER_RADIUS/);
  assert.match(styles, /authActions/);
  assert.match(searchRow, /floating=\{embeddedInForegroundSheet\}/);
  assert.match(searchRow, /resolveHomeCatalogHeaderPanelPaddingTop/);
  assert.match(layout, /HOME_CATALOG_HEADER_PANEL_TOP_GAP = 0/);
  assert.match(layout, /horizontal: HOME_CATALOG_HEADER_SHELL_HORIZONTAL_INSET/);
  assert.match(
    layout,
    /HOME_CATALOG_HEADER_CIRCLE_BUTTON_SIZE =\s*\n\s*HOME_CATALOG_HEADER_SEARCH_INPUT_MIN_HEIGHT/,
  );
  assert.match(layout, /HOME_CATALOG_HEADER_SEARCH_INPUT_BORDER_RADIUS = 999/);
  assert.doesNotMatch(searchRow, /marginHorizontal/);
  assert.match(layout, /HOME_CATALOG_HEADER_PANEL_BLUR_RADIUS = 18/);
  assert.match(layout, /HOME_CATALOG_HEADER_BOTTOM_MARGIN = 0/);
  assert.match(region, /location-on/);
  assert.match(region, /RuRegionPickerSheet/);
  assert.doesNotMatch(region, /compact/);
  assert.doesNotMatch(searchRow, /label=\{/);
});

test("home feed search is in scroll flow, not sticky overlay", () => {
  const index = readMobileFile("app/(tabs)/index.tsx");
  const styles = readMobileFile("shared/theme/homeCatalogHeaderStyles.ts");
  const search = readMobileFile("features/home-feed/ui/HomeCatalogHeaderSearch.tsx");
  const panel = readMobileFile("features/home-feed/ui/HomeCatalogHeaderPanel.tsx");

  assert.doesNotMatch(index, /HomeCatalogStickySearchShell/);
  assert.match(index, /ListHeaderComponent=\{homeFeedSearchListHeader\}/);
  assert.match(index, /homeFeedScrollTopInset/);
  assert.match(index, /HOME_CATALOG_HEADER_STICKY_TOP_OFFSET/);
  assert.doesNotMatch(index, /resolveHomeCatalogOverlayContentInsetTop/);
  assert.match(styles, /borderRadius: MOBILE_BOTTOM_NAV_BORDER_RADIUS/);
  assert.match(styles, /panelFloatingGlass/);
  assert.match(styles, /overflow: "hidden"/);
  assert.match(styles, /boxShadow: "none"/);
  assert.match(search, /PRODUCT_SEARCH_INPUT_UI/);
  assert.match(panel, /floating\s*\?\s*\[[\s\S]*styles\.panelFloating/);
  assert.match(panel, /panelFloatingGlass/);
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
  assert.match(animation, /menuExpanded/);
  assert.match(animation, /scheduleOpenAfterPaint/);
  assert.match(animation, /HOME_CATALOG_HEADER_USERS_STRETCH_ANIMATION_MS/);
  assert.match(animation, /HOME_CATALOG_HEADER_USERS_STRETCH_ANIMATION_EASING_CSS/);
  assert.match(animation, /transitionProperty: "height, background-color, border-color"/);
  assert.match(menu, /useCssTransition \? View : Animated\.View/);
  assert.match(menu, /menuExpanded/);
  assert.match(menu, /portalVisible \? <View style=\{styles\.usersNavPillPlaceholder\}/);
  assert.match(menu, /closedBackgroundColor: theme\.colors\.action/);
  assert.match(menu, /openBackgroundColor: theme\.colors\.surface/);
  assert.match(menu, /toggleIconColor/);

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
  assert.doesNotMatch(items, /key: "notifications"/);
});
