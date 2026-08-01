import assert from "node:assert/strict";
import { test } from "node:test";

import {
  isProductBadgeExplainKey,
  resolveListingOriginBadgeExplainKey,
  resolvePriceMarketBadgeExplainKey,
  resolveProductBadgeExplainContent,
} from "../dist/productBadgeExplain.js";

test("isProductBadgeExplainKey accepts known keys", () => {
  assert.equal(isProductBadgeExplainKey("original"), true);
  assert.equal(isProductBadgeExplainKey("listing_origin_own"), true);
  assert.equal(isProductBadgeExplainKey("nope"), false);
});

test("resolveListingOriginBadgeExplainKey maps origin values", () => {
  assert.equal(resolveListingOriginBadgeExplainKey("own"), "listing_origin_own");
  assert.equal(resolveListingOriginBadgeExplainKey("resale"), "listing_origin_resale");
  assert.equal(
    resolveListingOriginBadgeExplainKey("manufacturer"),
    "listing_origin_manufacturer",
  );
  assert.equal(resolveListingOriginBadgeExplainKey("unknown"), null);
});

test("resolvePriceMarketBadgeExplainKey maps status values", () => {
  assert.equal(resolvePriceMarketBadgeExplainKey("above_market"), "price_market_above");
  assert.equal(resolvePriceMarketBadgeExplainKey("at_market"), "price_market_at");
  assert.equal(resolvePriceMarketBadgeExplainKey("below_market"), "price_market_below");
  assert.equal(resolvePriceMarketBadgeExplainKey("unknown"), null);
});

test("resolveProductBadgeExplainContent prefers admin over fallback", () => {
  const withAdmin = resolveProductBadgeExplainContent({
    badgeKey: "raffle",
    adminRow: {
      description: "  Admin text  ",
      imageUrl: " /uploads/a.png ",
    },
    fallbackDescription: "Fallback",
  });
  assert.equal(withAdmin.description, "Admin text");
  assert.equal(withAdmin.imageUrl, "/uploads/a.png");

  const fallbackOnly = resolveProductBadgeExplainContent({
    badgeKey: "raffle",
    adminRow: null,
    fallbackDescription: "Fallback",
  });
  assert.equal(fallbackOnly.description, "Fallback");
  assert.equal(fallbackOnly.imageUrl, null);
});
