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
  const route = readMobileFile("app/raffle/[id].tsx");

  assert.match(route, /RaffleProductsPage/);
  assert.match(layout, /mediaHeight: 300/);
  assert.match(layout, /wideBreakpoint: 900/);
  assert.match(page, /RAFFLE_PRODUCTS_PAGE_LAYOUT/);
  assert.match(page, /useFeaturedRafflesQuery/);
  assert.match(page, /pagingEnabled/);
  assert.match(page, /blurBackground/);
  assert.match(page, /contentFit="contain"/);
  assert.match(page, /showSoundToggle/);
  assert.match(page, /RaffleManageActions/);
  assert.match(page, /CreateRaffleModal/);
  assert.match(page, /FeaturedRaffleWinnerCard/);
  assert.match(styles, /swipeOverlay/);
  assert.match(styles, /borderRadius: 22/);
  assert.match(media, /blurBackground/);
  assert.match(media, /contentFit/);
  assert.match(media, /MEDIA_BLUR_RADIUS = 28/);
});
