import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT_ROOT = join(MOBILE_ROOT, "..", "client");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");
const readClientFile = (relativePath) =>
  readFileSync(join(CLIENT_ROOT, "src", relativePath), "utf8");

test("auction page uses buyer/seller switcher without overview tiles", () => {
  const page = readMobileFile("features/auction-page/ui/AuctionPage.tsx");
  const toolbar = readMobileFile("features/auction-page/ui/AuctionPageToolbar.tsx");
  const webPage = readClientFile("pages/auction/ui/AuctionPage.jsx");
  const webToolbar = readClientFile("pages/auction/ui/AuctionPageToolbar.jsx");
  const filters = readMobileFile(
    "entities/product-price-offer/model/auctionViewFilters.ts",
  );
  const webFilters = readClientFile(
    "entities/product-price-offer/model/auctionViewFilters.js",
  );

  assert.match(page, /ProfileMobileSectionToggle/);
  assert.match(page, /AuctionPageToolbar/);
  assert.doesNotMatch(page, /AuctionPageOverview/);
  assert.doesNotMatch(page, /summarizeAuctionDashboard/);
  assert.doesNotMatch(page, /attentionOnly/);
  assert.match(page, /AUCTION_VIEW_FILTER_BUYER/);
  assert.match(page, /contentPaddingBottom/);
  assert.match(page, /listInAccountShell/);
  assert.match(page, /AuctionBuyerBidRow/);
  assert.match(page, /AuctionSellerOfferRow/);

  assert.doesNotMatch(webPage, /AuctionPageOverview/);
  assert.doesNotMatch(webPage, /attentionOnly/);
  assert.match(webPage, /AUCTION_VIEW_FILTER_BUYER/);

  assert.doesNotMatch(toolbar, /AUCTION_PAGE_UI\.TITLE/);
  assert.doesNotMatch(toolbar, /summaryCountLabel/);
  assert.doesNotMatch(webToolbar, /auction-page__toolbar/);
  assert.match(toolbar, /AUCTION_VIEW_FILTER_OPTIONS/);
  assert.match(toolbar, /viewSwitch/);
  assert.match(webToolbar, /role="tablist"/);
  assert.match(webToolbar, /auction-page__chips/);

  assert.doesNotMatch(filters, /VIEW_FILTER_ALL/);
  assert.doesNotMatch(webFilters, /VIEW_FILTER_ALL/);
  assert.match(filters, /VIEW_FILTER_BUYER/);
  assert.match(filters, /VIEW_FILTER_SELLER/);
});

test("auction page ui copy matches web auction dashboard", () => {
  const copy = readMobileFile("shared/config/appUiCopy.ts");
  const auctionUi = copy.match(
    /export const AUCTION_PAGE_UI = \{[\s\S]*?\n\} as const;/,
  );

  assert.ok(auctionUi);
  assert.match(auctionUi[0], /TITLE: "Аукцион"/);
  assert.match(auctionUi[0], /VIEW_FILTER_BUYER: "Мои ставки"/);
  assert.match(auctionUi[0], /VIEW_FILTER_SELLER: "Ставки покупателей"/);
  assert.doesNotMatch(auctionUi[0], /VIEW_FILTER_ALL/);
  assert.match(auctionUi[0], /BUYER_EMPTY:/);
  assert.match(auctionUi[0], /SELLER_EMPTY:/);
  assert.doesNotMatch(auctionUi[0], /EXPAND_ALL/);
  assert.doesNotMatch(auctionUi[0], /COLLAPSE_ALL/);
});

test("auction dashboard rows match web price-box + edit flow", () => {
  const buyerRow = readMobileFile(
    "entities/product-price-offer/ui/AuctionBuyerBidRow.tsx",
  );
  const sellerRow = readMobileFile(
    "entities/product-price-offer/ui/AuctionSellerOfferRow.tsx",
  );
  const editor = readMobileFile(
    "entities/product-price-offer/ui/AuctionDashboardBuyerPriceEditor.tsx",
  );
  const styles = readMobileFile("shared/theme/auctionPageStyles.ts");

  assert.match(buyerRow, /AuctionDashboardRowPrice/);
  assert.match(buyerRow, /STATUS_BUYER_PENDING/);
  assert.match(buyerRow, /isEditing/);
  assert.match(buyerRow, /EDIT_BID/);
  assert.match(buyerRow, /CANCEL_BID/);
  assert.doesNotMatch(buyerRow, /priceStrip/);
  assert.match(sellerRow, /AuctionDashboardRowPrice/);
  assert.match(sellerRow, /STATUS_SELLER_PENDING/);
  assert.doesNotMatch(sellerRow, /priceStrip/);
  assert.match(editor, /onClose/);
  assert.match(editor, /closeLabel/);
  assert.match(styles, /priceBox:/);
  assert.match(styles, /actions:/);
  assert.match(styles, /textBtnDanger:/);
  assert.match(styles, /viewSwitch:/);
  assert.doesNotMatch(styles, /overviewTile:/);
});
