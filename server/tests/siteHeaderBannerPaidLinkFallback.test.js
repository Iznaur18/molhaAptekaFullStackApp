import assert from "node:assert/strict";
import test from "node:test";

import { resolvePaidSiteHeaderBannerCampaignLinkPath } from "../services/site-header-banner/resolveSiteHeaderBannerPayload.js";

test("paid banner keeps explicit linkPath", () => {
  assert.equal(
    resolvePaidSiteHeaderBannerCampaignLinkPath({
      linkPath: "https://example.com/promo",
      advertiserId: "abc123",
    }),
    "https://example.com/promo",
  );
  assert.equal(
    resolvePaidSiteHeaderBannerCampaignLinkPath({
      linkPath: "/product/xyz",
      advertiserId: "abc123",
    }),
    "/product/xyz",
  );
});

test("paid banner without linkPath falls back to seller storefront", () => {
  assert.equal(
    resolvePaidSiteHeaderBannerCampaignLinkPath({
      linkPath: null,
      advertiserId: "6a7df94e5712931f9b485c1a",
    }),
    "/seller/6a7df94e5712931f9b485c1a",
  );
  assert.equal(
    resolvePaidSiteHeaderBannerCampaignLinkPath({
      linkPath: "   ",
      advertiserId: "abc",
    }),
    "/seller/abc",
  );
  assert.equal(
    resolvePaidSiteHeaderBannerCampaignLinkPath({
      linkPath: null,
      advertiserId: null,
    }),
    null,
  );
});
