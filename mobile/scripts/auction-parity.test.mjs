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
  const overview = readMobileFile("features/auction-page/ui/AuctionPageOverview.tsx");
  const buyerRow = readMobileFile("entities/product-price-offer/ui/AuctionBuyerBidRow.tsx");
  const sellerRow = readMobileFile("entities/product-price-offer/ui/AuctionSellerOfferRow.tsx");

  assert.match(page, /ProfileMobileSectionToggle/);
  assert.match(page, /AuctionPageToolbar/);
  assert.match(page, /AuctionPageOverview/);
  assert.match(page, /filterAuctionDashboard/);
  assert.match(page, /summarizeAuctionDashboard/);
  assert.doesNotMatch(page, /EXPAND_ALL/);
  assert.doesNotMatch(page, /COLLAPSE_ALL/);
  assert.doesNotMatch(page, /collapsible/);
  assert.match(page, /COUNT_FILTERED/);
  assert.match(page, /ListHeaderComponent/);
  assert.match(page, /contentPaddingBottom/);
  assert.match(page, /AuctionBuyerBidRow/);
  assert.match(page, /AuctionSellerOfferRow/);
  assert.match(page, /ATTENTION_FILTER_HINT/);
  assert.doesNotMatch(page, /sellerFlowStyles/);

  assert.match(toolbar, /AUCTION_PAGE_UI\.TITLE/);
  assert.match(toolbar, /summaryCountLabel/);
  assert.match(toolbar, /AUCTION_VIEW_FILTER_OPTIONS/);

  assert.match(overview, /OVERVIEW_BUYER_BIDS/);
  assert.match(overview, /OVERVIEW_INCOMING/);
  assert.match(overview, /OVERVIEW_ATTENTION/);

  assert.match(buyerRow, /AuctionDashboardBuyerPriceEditor/);
  assert.match(buyerRow, /priceOfferId|productId/);
  assert.match(buyerRow, /collapsible/);
  assert.match(buyerRow, /bidNeedsAttention/);

  assert.match(sellerRow, /AuctionDashboardSellerActions/);
  assert.match(sellerRow, /AuctionDashboardRowBuyerMeta/);
  assert.match(sellerRow, /collapsible/);
  assert.match(sellerRow, /offerNeedsAttention/);
});

test("auction page ui copy matches web auction dashboard", () => {
  const copy = readMobileFile("shared/config/appUiCopy.ts");
  const auctionUi = copy.match(/export const AUCTION_PAGE_UI = \{[\s\S]*?\n\} as const;/);

  assert.ok(auctionUi);
  assert.match(auctionUi[0], /TITLE: "Аукцион"/);
  assert.match(auctionUi[0], /BID_PRICE_LABEL: "Ставка"/);
  assert.match(auctionUi[0], /PAY_DEADLINE_LABEL: "Оплатить до"/);
  assert.match(auctionUi[0], /EDIT_PRICE_LABEL: "Новая цена, ₽"/);
  assert.match(auctionUi[0], /COUNT_FILTERED:/);
  assert.doesNotMatch(auctionUi[0], /EXPAND_ALL/);
  assert.doesNotMatch(auctionUi[0], /COLLAPSE_ALL/);
  assert.match(auctionUi[0], /OVERVIEW_ATTENTION: "Нужно действие"/);
});
