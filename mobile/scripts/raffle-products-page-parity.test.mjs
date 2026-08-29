import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("RaffleProductsPage: web parity hero/swipe/progress/manage", () => {
  const page = readMobileFile("features/raffle-products-page/ui/RaffleProductsPage.tsx");
  const styles = readMobileFile("shared/theme/commerceScreenStyles.ts");
  const layout = readMobileFile("entities/raffle/lib/raffleProductsPageLayout.ts");
  const media = readMobileFile("entities/raffle/ui/RafflePrizeMedia.tsx");
  const route = readMobileFile("app/(tabs)/raffle/[id].tsx");
  const tabsLayout = readMobileFile("app/(tabs)/_layout.tsx");
  const homeTabRoute = readMobileFile("shared/lib/isHomeTabBarRoute.ts");

  assert.match(route, /RaffleProductsPage/);
  assert.doesNotMatch(route, /ScreenWithBack/);
  assert.match(tabsLayout, /name="raffle\/\[id\]"/);
  assert.match(homeTabRoute, /isRaffleProductsPath/);
  assert.match(layout, /mediaHeight: 300/);
  assert.match(layout, /wideBreakpoint: 900/);
  assert.match(page, /RAFFLE_PRODUCTS_PAGE_LAYOUT/);
  assert.match(page, /contentPaddingHorizontal/);
  assert.match(page, /useFeaturedRafflesQuery/);
  assert.match(page, /pagingEnabled/);
  assert.match(page, /blurBackground/);
  assert.match(page, /contentFit="contain"/);
  assert.match(page, /RafflePrizeMediaSoundToggle/);
  assert.match(page, /isRaffleMediaMuted/);
  assert.match(media, /RafflePrizeMediaSoundToggle/);
  assert.match(media, /onUnmuteRejected/);
  assert.match(page, /RaffleManageActions/);
  assert.match(page, /CreateRaffleModal/);
  assert.match(page, /FeaturedRaffleWinnerCard/);
  assert.match(page, /pointerEvents="none"/);
  assert.match(page, /onScrollEndDrag=\{handleSwipeScrollEnd\}/);
  assert.match(styles, /swipeOverlay/);
  assert.match(styles, /touchAction: "pan-y"/);
  assert.match(styles, /swipeSoundToggle/);
  assert.match(styles, /zIndex: 6/);
  assert.match(styles, /borderRadius: 22/);
  assert.match(styles, /paddingTop: 8/);
  assert.match(page, /productsBlock/);
  assert.match(styles, /productsBlock:/);
  assert.match(styles, /productsBlockMarginTop/);
  assert.match(styles, /manageDesktopMarginBottom/);
  assert.match(styles, /summarySideHeaderMarginTopWide/);
  assert.match(styles, /headerCardWide:/);
  assert.match(styles, /progressWide:/);
  assert.match(media, /blurBackground/);
  assert.match(media, /mediaBlurBgVideo/);
  assert.match(media, /MEDIA_BLUR_RADIUS = 28/);
});
