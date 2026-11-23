import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT = join(ROOT, "../client/src");

const readMobile = (p) => readFileSync(join(ROOT, p), "utf8");
const readClient = (p) => readFileSync(join(CLIENT, p), "utf8");

test("12.1 auction stackGap/toolbar/chips/overview/thumb + accept/reject", () => {
  const layout = readMobile("shared/lib/guestProfileLayout.ts");
  const styles = readMobile("shared/theme/auctionPageStyles.ts");
  const actions = readMobile(
    "entities/product-price-offer/ui/AuctionDashboardSellerActions.tsx",
  );
  const sellerRow = readMobile(
    "entities/product-price-offer/ui/AuctionSellerOfferRow.tsx",
  );
  const webCss = readClient("pages/auction/ui/AuctionPage.css");
  const webDash = readClient(
    "entities/product-price-offer/ui/AuctionDashboard.css",
  );
  const webChip = readClient("shared/styles/statusFilterChipActive.css");
  const webActions = readClient(
    "entities/product-price-offer/ui/AuctionDashboardSellerActions.jsx",
  );

  assert.match(webCss, /gap:\s*0\.85rem/);
  assert.match(webCss, /border-radius:\s*16px/);
  assert.match(layout, /AUCTION_PAGE_LAYOUT[\s\S]*stackGap: 13\.6/);
  assert.match(layout, /AUCTION_PAGE_LAYOUT[\s\S]*toolbarRadius: 16/);

  assert.match(webCss, /overview-tile[\s\S]*border-radius:\s*16px/);
  assert.match(styles, /OVERVIEW_TILE_RADIUS = 16/);

  assert.match(webDash, /thumb[\s\S]*width:\s*3\.25rem/);
  assert.match(webDash, /thumb[\s\S]*border-radius:\s*12px/);
  assert.match(styles, /THUMB_SIZE = 52/);
  assert.match(styles, /THUMB_RADIUS = 12/);

  assert.match(webDash, /border-radius:\s*18px/);
  assert.match(styles, /ROW_RADIUS = 18/);
  assert.match(styles, /ROW_PADDING = 12/);
  assert.match(styles, /ROW_GAP = 10\.4/);

  assert.match(webChip, /auction-page__chip_active/);
  assert.match(webChip, /warning-surface/);
  assert.match(styles, /viewChipActive:[\s\S]*warningSurface/);
  assert.match(styles, /viewChipTextActive:[\s\S]*warningText/);

  assert.match(webActions, /onAccept/);
  assert.match(webActions, /onReject/);
  assert.match(webActions, /btn_secondary/);
  assert.match(webActions, /btn_accept/);
  assert.match(actions, /decisionBtnAccept/);
  assert.match(actions, /decisionBtnReject/);
  assert.match(actions, /onAccept/);
  assert.match(actions, /onReject/);
  assert.match(styles, /DECISION_BTN_RADIUS = 12/);
  assert.match(styles, /decisionBtnReject:[\s\S]*borderStrong/);
  assert.match(sellerRow, /handleAccept/);
  assert.match(sellerRow, /handleReject/);
});

test("12.2 raffle featured card r22 + reveal pill + media 300/22", () => {
  const featuredStyles = readMobile("shared/theme/raffleFeaturedStyles.ts");
  const revealBtn = readMobile(
    "features/home-feed/ui/HomeFeaturedRafflesRevealButton.tsx",
  );
  const banner = readMobile("entities/raffle/ui/RaffleFeaturedBanner.tsx");
  const pageLayout = readMobile("entities/raffle/lib/raffleProductsPageLayout.ts");
  const commerce = readMobile("shared/theme/commerceScreenStyles.ts");
  const page = readMobile("features/raffle-products-page/ui/RaffleProductsPage.tsx");
  const sharedLib = readFileSync(
    join(ROOT, "../packages/shared-lib/src/raffleFeaturedBannerMetrics.ts"),
    "utf8",
  );
  const webFeatured = readClient("entities/raffle/ui/RaffleFeaturedHomeSection.css");
  const webProducts = readClient("pages/raffle/ui/RaffleProductsPage.css");
  const webModalCard = readClient("entities/raffle/ui/FeaturedRaffleModalCard.css");

  assert.match(sharedLib, /RAFFLE_FEATURED_CARD_BORDER_RADIUS = 22/);
  assert.match(featuredStyles, /RAFFLE_FEATURED_BANNER_BORDER_RADIUS/);
  assert.match(featuredStyles, /RAFFLE_REVEAL_BUTTON_BORDER_RADIUS = 999/);
  assert.match(banner, /RAFFLE_FEATURED_BANNER_BORDER_RADIUS/);
  assert.match(revealBtn, /RAFFLE_REVEAL_BUTTON_BORDER_RADIUS/);
  assert.match(webFeatured, /border-radius:\s*var\(--iz-radius-pill\)/);
  assert.match(webModalCard, /border-radius:\s*22px/);

  assert.match(webProducts, /height:\s*300px/);
  assert.match(webProducts, /border-radius:\s*22px/);
  assert.match(pageLayout, /mediaHeight: 300/);
  assert.match(pageLayout, /mediaRadius: 22/);
  assert.match(commerce, /borderRadius: L\.mediaRadius/);
  assert.match(page, /L\.mediaHeight/);
});

test("12.2 create raffle hub form chrome vs web modal", () => {
  const styles = readMobile("shared/theme/createRafflePageStyles.ts");
  const page = readMobile("features/create-raffle-page/ui/CreateRafflePage.tsx");
  const formBody = readMobile(
    "features/create-raffle-page/ui/CreateRaffleFormBody.tsx",
  );
  const webCss = readClient("entities/raffle/ui/CreateRaffleModal.css");

  assert.match(page, /CreateRaffleFormBody/);
  assert.match(page, /CreateRaffleWizardProgress/);
  assert.match(formBody, /SECTION_BASIC/);
  assert.match(formBody, /SECTION_PRIZE/);
  assert.match(formBody, /SECTION_CONDITIONS/);

  assert.match(webCss, /create-raffle-modal__section/);
  assert.match(webCss, /border-radius:\s*0\.7rem/);
  assert.match(webCss, /surface-muted/);

  assert.match(styles, /borderRadius: 11\.2/);
  assert.match(styles, /sectionTitle:[\s\S]*surfaceMuted/);
  assert.match(styles, /sectionTitle:[\s\S]*textSecondary/);
  assert.match(styles, /sectionBody:[\s\S]*surfaceMuted/);
  assert.match(styles, /mediaType:[\s\S]*surfaceMuted/);
  assert.match(styles, /form:[\s\S]*gap: 10\.4/);
  assert.match(styles, /wizardPrimaryBtn:[\s\S]*minHeight: 44/);
  assert.doesNotMatch(styles, /section:[\s\S]*elevation:/);
});
