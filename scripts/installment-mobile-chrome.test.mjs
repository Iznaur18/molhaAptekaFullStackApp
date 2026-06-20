import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT = join(ROOT, "client");

const readClientFile = (relativePath) =>
  readFileSync(join(CLIENT, relativePath), "utf8");

test("installment contract card uses compact summary and folded payments", () => {
  const card = readClientFile("src/entities/installment/ui/InstallmentContractCard.jsx");
  const payments = readClientFile(
    "src/entities/installment/ui/InstallmentContractCardPayments.jsx",
  );

  assert.match(card, /InstallmentContractCardSummary/);
  assert.match(card, /InstallmentContractCardPayments/);
  assert.match(payments, /partitionInstallmentContractPayments/);
  assert.match(payments, /installment-contract-card__payments-fold/);
});

test("installment mobile chrome styles target 640px breakpoint", () => {
  const cardMobile = readClientFile(
    "src/entities/installment/ui/InstallmentContractCardMobile.css",
  );
  const pageMobile = readClientFile(
    "src/entities/installment/ui/InstallmentPageLayoutMobile.css",
  );
  const buyerMobile = readClientFile(
    "src/entities/installment/ui/InstallmentBuyerBlockMobile.css",
  );

  assert.match(cardMobile, /@media \(max-width: 640px\)/);
  assert.match(pageMobile, /installment-page__chips[\s\S]*overflow-x: auto/);

  const panelCss = readClientFile("src/shared/ui/profileQueueContentPanel.css");
  const ordersPage = readClientFile("src/pages/my-orders/ui/MyOrdersPage.jsx");
  const salesPage = readClientFile("src/pages/my-sales/ui/MySalesPage.jsx");

  const layout = readClientFile("src/entities/installment/ui/InstallmentPageLayout.jsx");

  assert.match(panelCss, /\.profile-queue-content-panel[\s\S]*--iz-color-surface-subtle/);
  assert.doesNotMatch(layout, /profile-queue-content-panel/);
  assert.match(
    readClientFile("src/entities/installment/ui/InstallmentPageLayout.css"),
    /installment-page__list[\s\S]*background: transparent/,
  );
  assert.match(ordersPage, /my-orders-page__list/);
  assert.doesNotMatch(ordersPage, /profile-queue-content-panel/);
  assert.doesNotMatch(panelCss, /\.my-orders-page__list[\s\S]*--iz-color-surface-subtle/);
  assert.match(salesPage, /my-sales-page__list/);
  assert.doesNotMatch(salesPage, /profile-queue-content-panel/);
  assert.doesNotMatch(panelCss, /\.my-sales-page__list[\s\S]*--iz-color-surface-subtle/);
  assert.match(buyerMobile, /installment-buyer-block__form[\s\S]*background: transparent/);

  const auctionPage = readClientFile("src/pages/auction/ui/AuctionPage.jsx");
  const dashboardCss = readClientFile(
    "src/entities/product-price-offer/ui/AuctionDashboard.css",
  );

  assert.match(auctionPage, /auction-dashboard/);
  assert.doesNotMatch(auctionPage, /profile-queue-content-panel/);
  assert.doesNotMatch(panelCss, /\.auction-dashboard[\s\S]*--iz-color-surface-subtle/);
  assert.match(auctionPage, /AuctionPageToolbar/);
  assert.match(dashboardCss, /auction-dashboard-row__price-strip/);
  assert.match(dashboardCss, /auction-dashboard-row__composer/);
  assert.match(
    readClientFile("src/entities/product-price-offer/ui/AuctionBuyerBidRow.jsx"),
    /AuctionDashboardBuyerPriceEditor/,
  );

  const subscriptionsPage = readClientFile("src/pages/subscriptions/ui/SubscriptionsPage.jsx");
  const subscriptionsCss = readClientFile("src/pages/subscriptions/ui/SubscriptionsPage.css");
  const wishlistCss = readClientFile("src/pages/wishlist/ui/WishlistPage.css");

  assert.match(subscriptionsPage, /className="subscriptions-page"/);
  assert.doesNotMatch(subscriptionsPage, /profile-queue-content-panel/);
  assert.doesNotMatch(panelCss, /\.subscriptions-page/);
  assert.match(subscriptionsCss, /\.subscriptions-page[\s\S]*background: transparent/);
  assert.match(wishlistCss, /\.wishlist-page[\s\S]*background: transparent/);
});
