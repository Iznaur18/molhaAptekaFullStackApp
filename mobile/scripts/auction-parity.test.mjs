import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("auction page mirrors web toolbar and dashboard rows", () => {
  const page = readMobileFile("features/auction-page/ui/AuctionPage.tsx");
  const toolbar = readMobileFile("features/auction-page/ui/AuctionPageToolbar.tsx");
  const buyerRow = readMobileFile("entities/product-price-offer/ui/AuctionBuyerBidRow.tsx");
  const sellerRow = readMobileFile("entities/product-price-offer/ui/AuctionSellerOfferRow.tsx");

  assert.match(page, /ProfileMobileSectionToggle/);
  assert.match(page, /AuctionPageToolbar/);
  assert.match(page, /ListHeaderComponent/);
  assert.match(page, /contentPaddingBottom/);
  assert.match(page, /AuctionBuyerBidRow/);
  assert.match(page, /AuctionSellerOfferRow/);
  assert.doesNotMatch(page, /sellerFlowStyles/);

  assert.match(toolbar, /AUCTION_PAGE_UI\.TITLE/);
  assert.match(toolbar, /COUNT_BIDS/);
  assert.match(toolbar, /COUNT_OFFERS/);

  assert.match(buyerRow, /AuctionDashboardBuyerPriceEditor/);
  assert.match(buyerRow, /CheckoutForm/);
  assert.match(buyerRow, /PAY_BUTTON/);
  assert.match(buyerRow, /priceOfferId/);

  assert.match(sellerRow, /AuctionDashboardSellerActions/);
  assert.match(sellerRow, /UserPremiumDisplayName/);
});

test("auction page ui copy matches web auction dashboard", () => {
  const copy = readMobileFile("shared/config/appUiCopy.ts");

  assert.match(copy, /TITLE: "Аукцион"/);
  assert.match(copy, /BID_PRICE_LABEL: "Ставка"/);
  assert.match(copy, /PAY_DEADLINE_LABEL: "Оплатить до"/);
  assert.match(copy, /EDIT_PRICE_LABEL: "Новая цена, ₽"/);
  assert.match(copy, /PAY_BUTTON: "Оплатить по принятой цене"/);
});
