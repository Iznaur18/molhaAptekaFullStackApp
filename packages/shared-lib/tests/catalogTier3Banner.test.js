import assert from "node:assert/strict";
import { test } from "node:test";

import {
  CATALOG_TIER3_BANNER_ROW_INTERVAL,
  interleaveCatalogTier3Banners,
  isProductTier3BannerPromotion,
  shouldShowProductTier3BannerFullWidth,
} from "../dist/catalogTier3Banner.js";

const futureExpiry = () => new Date(Date.now() + 86_400_000).toISOString();

const banner = (id, activatedAt = "2026-01-01T00:00:00.000Z") => ({
  _id: id,
  catalogPromotionTier: 3,
  catalogPromotionExpiresAt: futureExpiry(),
  catalogPromotionActivatedAt: activatedAt,
});

const regular = (id) => ({ _id: id });

test("isProductTier3BannerPromotion requires active tier-3 promotion", () => {
  assert.equal(isProductTier3BannerPromotion(banner("b1")), true);
  assert.equal(
    isProductTier3BannerPromotion({
      _id: "x",
      catalogPromotionTier: 3,
      catalogPromotionExpiresAt: "2020-01-01T00:00:00.000Z",
    }),
    false,
  );
  assert.equal(isProductTier3BannerPromotion(regular("r1")), false);
});

test("shouldShowProductTier3BannerFullWidth respects mine mode and catalog flag", () => {
  const product = banner("b1");
  assert.equal(
    shouldShowProductTier3BannerFullWidth(product, { showFullWidthTier3Banners: false }),
    false,
  );
  assert.equal(
    shouldShowProductTier3BannerFullWidth(product, { showFullWidthTier3Banners: true }),
    true,
  );
  assert.equal(
    shouldShowProductTier3BannerFullWidth(product, {
      isMineMode: true,
      showFullWidthTier3Banners: true,
    }),
    false,
  );
});

test("interleaveCatalogTier3Banners inserts banner after every N card rows", () => {
  const products = [
    ...Array.from({ length: 6 }, (_, index) => regular(`r${index + 1}`)),
    banner("b-new", "2026-02-01T00:00:00.000Z"),
    banner("b-old", "2026-01-01T00:00:00.000Z"),
  ];

  const interleaved = interleaveCatalogTier3Banners(products, 2, { enabled: true });
  const bannerIds = interleaved.filter((item) => item._id?.startsWith("b")).map((item) => item._id);

  assert.equal(CATALOG_TIER3_BANNER_ROW_INTERVAL, 3);
  assert.deepEqual(bannerIds, ["b-new", "b-old"]);
  assert.equal(
    interleaved.findIndex((item) => item._id === "b-new"),
    6,
  );
  assert.equal(interleaved.at(-1)?._id, "b-old");
});

test("interleaveCatalogTier3Banners appends leftover banners when feed is short", () => {
  const products = [
    regular("r1"),
    regular("r2"),
    regular("r3"),
    banner("b1", "2026-02-01T00:00:00.000Z"),
  ];

  const interleaved = interleaveCatalogTier3Banners(products, 2, { enabled: true });

  assert.deepEqual(
    interleaved.map((item) => item._id),
    ["r1", "r2", "r3", "b1"],
  );
});
