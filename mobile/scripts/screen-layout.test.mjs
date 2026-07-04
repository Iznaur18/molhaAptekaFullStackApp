import assert from "node:assert/strict";
import { test } from "node:test";

// Mirror of shared/lib/screenBreakpoints.ts (keep in sync)
const SCREEN_NARROW_MAX_WIDTH = 359;
const SCREEN_SMALL_TABLET_MIN_WIDTH = 600;
const SCREEN_MEDIUM_TABLET_MIN_WIDTH = 768;
const SCREEN_LARGE_TABLET_MIN_WIDTH = 1024;
const SCREEN_PRODUCT_GRID_2_COL_MAX_WIDTH = 667;
const SCREEN_PRODUCT_GRID_3_COL_MAX_WIDTH = 903;
const SCREEN_PRODUCT_GRID_4_COL_MIN_WIDTH = 1280;
const SCREEN_CONTENT_MAX_WIDTH_SMALL_TABLET = 520;
const SCREEN_CONTENT_MAX_WIDTH_MEDIUM_TABLET = 720;
const SCREEN_CONTENT_MAX_WIDTH_LARGE_TABLET = 960;
const PROFILE_CONTENT_MAX_WIDTH_PHONE = 420;
const PROFILE_CONTENT_MAX_WIDTH_SMALL_TABLET = 560;
const PROFILE_CONTENT_MAX_WIDTH_MEDIUM_TABLET = 640;
const PROFILE_CONTENT_MAX_WIDTH_LARGE_TABLET = 720;
const PRODUCT_GRID_GAP = 6;
const PRODUCT_GRID_COLUMNS_COMPACT = 2;
const PRODUCT_GRID_COLUMNS_MEDIUM = 3;
const PRODUCT_GRID_COLUMNS_WIDE = 4;

const resolveProductGridColumns = ({ width }) => {
  if (width <= SCREEN_PRODUCT_GRID_2_COL_MAX_WIDTH) {
    return PRODUCT_GRID_COLUMNS_COMPACT;
  }
  if (width <= SCREEN_PRODUCT_GRID_3_COL_MAX_WIDTH) {
    return PRODUCT_GRID_COLUMNS_MEDIUM;
  }
  if (width < SCREEN_PRODUCT_GRID_4_COL_MIN_WIDTH) {
    return PRODUCT_GRID_COLUMNS_MEDIUM;
  }
  return PRODUCT_GRID_COLUMNS_WIDE;
};

const resolveProductGridGap = (width) => {
  if (width <= SCREEN_PRODUCT_GRID_2_COL_MAX_WIDTH) {
    return 2;
  }
  if (width <= SCREEN_PRODUCT_GRID_3_COL_MAX_WIDTH) {
    return 2.4;
  }
  return 16;
};

const resolveScreenWidthTier = (width) => {
  if (width <= SCREEN_NARROW_MAX_WIDTH) return "phone-narrow";
  if (width < SCREEN_SMALL_TABLET_MIN_WIDTH) return "phone";
  if (width < SCREEN_MEDIUM_TABLET_MIN_WIDTH) return "tablet-small";
  if (width < SCREEN_LARGE_TABLET_MIN_WIDTH) return "tablet-medium";
  return "tablet-large";
};

const resolveContentMaxWidth = (width) => {
  const tier = resolveScreenWidthTier(width);
  if (tier === "tablet-large") return SCREEN_CONTENT_MAX_WIDTH_LARGE_TABLET;
  if (tier === "tablet-medium") return SCREEN_CONTENT_MAX_WIDTH_MEDIUM_TABLET;
  if (tier === "tablet-small") return SCREEN_CONTENT_MAX_WIDTH_SMALL_TABLET;
  return undefined;
};

const resolveLayoutContentWidth = (width) => {
  const maxWidth = resolveContentMaxWidth(width);
  return maxWidth != null ? Math.min(width, maxWidth) : width;
};

const resolveProfileContentMaxWidth = (width) => {
  const tier = resolveScreenWidthTier(width);
  if (tier === "tablet-large") return PROFILE_CONTENT_MAX_WIDTH_LARGE_TABLET;
  if (tier === "tablet-medium") return PROFILE_CONTENT_MAX_WIDTH_MEDIUM_TABLET;
  if (tier === "tablet-small") return PROFILE_CONTENT_MAX_WIDTH_SMALL_TABLET;
  return PROFILE_CONTENT_MAX_WIDTH_PHONE;
};

test("resolveProductGridColumns: home feed 2 cols up to 667", () => {
  assert.equal(resolveProductGridColumns({ width: 320, height: 640 }), 2);
  assert.equal(resolveProductGridColumns({ width: 390, height: 844 }), 2);
  assert.equal(resolveProductGridColumns({ width: 667, height: 1024 }), 2);
});

test("resolveProductGridColumns: home feed 3 cols after 667 until 1280", () => {
  assert.equal(resolveProductGridColumns({ width: 668, height: 1024 }), 3);
  assert.equal(resolveProductGridColumns({ width: 769, height: 1024 }), 3);
  assert.equal(resolveProductGridColumns({ width: 1024, height: 1366 }), 3);
  assert.equal(resolveProductGridColumns({ width: 1279, height: 800 }), 3);
});

test("resolveProductGridColumns: home feed 4 cols from 1280", () => {
  assert.equal(resolveProductGridColumns({ width: 1280, height: 800 }), 4);
});

test("resolveProductGridGap: responsive home feed gaps", () => {
  assert.equal(resolveProductGridGap(390), 2);
  assert.equal(resolveProductGridGap(800), 2.4);
  assert.equal(resolveProductGridGap(1280), 16);
});

test("width tiers for layout chrome unchanged", () => {
  assert.equal(resolveScreenWidthTier(768), "tablet-medium");
  assert.equal(resolveScreenWidthTier(1024), "tablet-large");
});

test("resolveContentMaxWidth: four ascending tiers", () => {
  assert.equal(resolveContentMaxWidth(390), undefined);
  assert.equal(resolveContentMaxWidth(600), SCREEN_CONTENT_MAX_WIDTH_SMALL_TABLET);
  assert.equal(resolveContentMaxWidth(768), SCREEN_CONTENT_MAX_WIDTH_MEDIUM_TABLET);
  assert.equal(resolveContentMaxWidth(1024), SCREEN_CONTENT_MAX_WIDTH_LARGE_TABLET);
});

test("resolveProfileContentMaxWidth: four ascending tiers", () => {
  assert.equal(resolveProfileContentMaxWidth(390), PROFILE_CONTENT_MAX_WIDTH_PHONE);
  assert.equal(resolveProfileContentMaxWidth(600), PROFILE_CONTENT_MAX_WIDTH_SMALL_TABLET);
  assert.equal(resolveProfileContentMaxWidth(768), PROFILE_CONTENT_MAX_WIDTH_MEDIUM_TABLET);
  assert.equal(resolveProfileContentMaxWidth(1024), PROFILE_CONTENT_MAX_WIDTH_LARGE_TABLET);
});

test("resolveLayoutContentWidth: caps on tablet", () => {
  assert.equal(resolveLayoutContentWidth(768), SCREEN_CONTENT_MAX_WIDTH_MEDIUM_TABLET);
  assert.equal(resolveLayoutContentWidth(1024), SCREEN_CONTENT_MAX_WIDTH_LARGE_TABLET);
});
