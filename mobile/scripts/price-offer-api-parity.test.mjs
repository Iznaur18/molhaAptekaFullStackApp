import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT_ROOT = join(MOBILE_ROOT, "..", "client");

const readSource = (root, relativePath) =>
  readFileSync(join(root, relativePath), "utf8");

test("mobile fetchTopPriceOffers reads data.data.top like web", () => {
  const mobileSource = readSource(
    MOBILE_ROOT,
    "entities/product-price-offer/api/fetchTopPriceOffers.ts",
  );
  const webSource = readSource(
    CLIENT_ROOT,
    "src/entities/product-price-offer/api/fetchTopPriceOffers.js",
  );

  assert.match(mobileSource, /data\.data\?\.top/);
  assert.match(mobileSource, /return data\.data\.top/);
  assert.doesNotMatch(mobileSource, /data\.data\?\.offers/);
  assert.match(webSource, /data\.data\?\.top/);
});

test("mobile dashboard price-offer APIs use bids and offers fields", () => {
  const source = readSource(
    MOBILE_ROOT,
    "entities/product-price-offer/api/incomingPriceOffersApi.ts",
  );

  assert.match(source, /data\.data\?\.bids/);
  assert.match(source, /data\.data\?\.offers/);
});

test("auction dashboard rows resolve product image URLs for mobile", () => {
  const resolver = readSource(
    MOBILE_ROOT,
    "entities/product-price-offer/lib/resolvePriceOfferProductImageUrl.ts",
  );
  const thumb = readSource(
    MOBILE_ROOT,
    "entities/product-price-offer/ui/AuctionDashboardProductThumb.tsx",
  );
  const sellerRow = readSource(
    MOBILE_ROOT,
    "entities/product-price-offer/ui/AuctionSellerOfferRow.tsx",
  );

  const sellerActions = readSource(
    MOBILE_ROOT,
    "entities/product-price-offer/ui/AuctionDashboardSellerActions.tsx",
  );

  const styles = readSource(MOBILE_ROOT, "shared/theme/auctionPageStyles.ts");

  assert.match(resolver, /resolveProductImageUrl/);
  assert.match(thumb, /resolvePriceOfferProductImageUrl/);
  assert.match(thumb, /onError/);
  assert.match(thumb, /thumbSlot/);
  assert.match(sellerRow, /AuctionDashboardProductThumb/);
  assert.match(sellerRow, /AuctionDashboardRowBuyerMeta/);
  assert.match(styles, /decision:\s*\{[\s\S]*flexDirection: "row"/);
  assert.doesNotMatch(sellerActions, /decisionStacked/);
  assert.doesNotMatch(sellerActions, /useWindowDimensions/);
  assert.doesNotMatch(sellerRow, /metaRow/);
  assert.doesNotMatch(sellerRow, /productImageUrl \?\? null/);
});

test("ProductAuctionTab renders server top-offer fields", () => {
  const source = readSource(
    MOBILE_ROOT,
    "features/product-detail/ui/ProductAuctionTab.tsx",
  );

  assert.match(source, /ProductPriceOfferTopList/);
  assert.doesNotMatch(source, /offerPriceRub/);
});
