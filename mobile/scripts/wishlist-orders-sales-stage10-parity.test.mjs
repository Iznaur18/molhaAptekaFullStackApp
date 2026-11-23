import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT = join(ROOT, "../client/src");

const readMobile = (p) => readFileSync(join(ROOT, p), "utf8");
const readClient = (p) => readFileSync(join(CLIENT, p), "utf8");

test("wishlist hero: no shadow + ls 0.6/−1.02; row 6×10.4 / r12 / thumb 64", () => {
  const styles = readMobile("shared/theme/wishlistPageStyles.ts");
  const page = readMobile("features/wishlist-page/ui/WishlistPage.tsx");
  const hero = readMobile("shared/lib/profileListHeroChrome.ts");
  const layout = readMobile("shared/lib/guestProfileLayout.ts");
  const webRow = readClient("pages/wishlist/ui/WishlistRow.css");

  assert.match(hero, /captionLetterSpacing: 0\.6/);
  assert.match(hero, /valueLetterSpacing: -1\.02/);
  assert.match(styles, /PROFILE_LIST_HERO_NO_SHADOW/);
  assert.match(styles, /letterSpacing: HERO\.captionLetterSpacing/);
  assert.match(styles, /letterSpacing: HERO\.valueLetterSpacing/);
  assert.match(styles, /PRODUCT_IMAGE_THUMB_SIDE = 64/);
  assert.match(styles, /paddingVertical: 6/);
  assert.match(styles, /paddingHorizontal: 10\.4/);
  assert.match(styles, /borderRadius: 12/);
  assert.match(layout, /WISHLIST_PAGE_LAYOUT[\s\S]*listGap: 4/);
  assert.match(page, /WishlistRow/);
  assert.doesNotMatch(page, /ProductCard/);
  assert.doesNotMatch(styles, /PRODUCT_IMAGE_THUMB_SIDE = 112/);
  assert.match(webRow, /padding:\s*0\.375rem 0\.65rem/);
});

test("orders toolbar pad12 r16 chips4×8 stackGap13.6; card r20; detail route", () => {
  const styles = readMobile("shared/theme/myOrdersPageStyles.ts");
  const layout = readMobile("shared/lib/guestProfileLayout.ts");
  const commerce = readMobile("shared/theme/commerceScreenStyles.ts");
  const page = readMobile("features/my-orders-page/ui/MyOrdersPage.tsx");
  const detail = readMobile("features/my-orders-page/ui/OrderDetailPage.tsx");
  const route = readMobile("app/orders/[id].tsx");
  const webCss = readClient("pages/my-orders/ui/MyOrdersPage.css");
  const webCard = readClient("entities/order/ui/OrderCard.css");

  assert.match(webCss, /gap:\s*0\.85rem/);
  assert.match(webCss, /padding:\s*0\.75rem/);
  assert.match(webCss, /border-radius:\s*16px/);
  assert.match(webCss, /padding:\s*0\.25rem 0\.5rem/);
  assert.match(webCss, /surface-muted/);
  assert.match(webCard, /border-radius:\s*20px/);

  assert.match(layout, /MY_ORDERS_PAGE_LAYOUT[\s\S]*stackGap: 13\.6/);
  assert.match(layout, /MY_ORDERS_PAGE_LAYOUT[\s\S]*toolbarPadding: 12/);
  assert.match(layout, /MY_ORDERS_PAGE_LAYOUT[\s\S]*toolbarRadius: 16/);
  assert.match(styles, /CHIP_PADDING_VERTICAL = 4/);
  assert.match(styles, /CHIP_PADDING_HORIZONTAL = 8/);
  assert.match(styles, /backgroundColor: theme\.colors\.surfaceMuted/);
  assert.match(commerce, /ORDER_CARD_RADIUS = 20/);
  assert.match(page, /AUTH_REQUIRED/);
  assert.match(page, /AppButton/);
  assert.match(page, /ScreenErrorState/);
  assert.match(page, /EMPTY/);
  assert.match(detail, /OrderDetailPage|AUTH_REQUIRED|ScreenErrorState/);
  assert.match(route, /OrderDetailPage/);
});

test("sales chrome matches orders; toolbar bg surface vs orders surfaceMuted", () => {
  const sales = readMobile("shared/theme/mySalesPageStyles.ts");
  const orders = readMobile("shared/theme/myOrdersPageStyles.ts");
  const layout = readMobile("shared/lib/guestProfileLayout.ts");
  const page = readMobile("features/my-sales-page/ui/MySalesPage.tsx");
  const webSales = readClient("pages/my-sales/ui/MySalesPage.css");
  const webOrders = readClient("pages/my-orders/ui/MyOrdersPage.css");

  assert.match(webSales, /background:\s*var\(--iz-color-surface\)/);
  assert.match(webOrders, /background:\s*var\(--iz-color-surface-muted\)/);

  assert.match(layout, /MY_SALES_PAGE_LAYOUT[\s\S]*stackGap: 13\.6/);
  assert.match(layout, /MY_SALES_PAGE_LAYOUT[\s\S]*toolbarPadding: 12/);
  assert.match(layout, /MY_SALES_PAGE_LAYOUT[\s\S]*toolbarRadius: 16/);
  assert.match(sales, /CHIP_PADDING_VERTICAL = 4/);
  assert.match(sales, /CHIP_PADDING_HORIZONTAL = 8/);
  assert.match(
    sales,
    /toolbar:[\s\S]*backgroundColor: theme\.colors\.surface,/,
  );
  assert.match(
    orders,
    /toolbar:[\s\S]*backgroundColor: theme\.colors\.surfaceMuted,/,
  );
  assert.match(page, /AppButton/);
  assert.match(page, /LOGIN_HINT/);
  assert.match(page, /ScreenErrorState/);
  assert.doesNotMatch(page, /styles\.buttonText/);
});
