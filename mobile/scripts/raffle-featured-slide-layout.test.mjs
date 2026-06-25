import assert from "node:assert/strict";
import { test } from "node:test";

const HOME_CATALOG_HEADER_SHELL_HORIZONTAL_INSET = 16;
const RAFFLE_FEATURED_SLIDE_GAP = 12;

// Mirror of useRaffleFeaturedSlideLayout.ts (keep in sync)
const resolveRaffleFeaturedSlideWidth = (layoutWidth) =>
  Math.max(0, layoutWidth - HOME_CATALOG_HEADER_SHELL_HORIZONTAL_INSET * 2);

const resolveRaffleFeaturedSnapInterval = (slideWidth) =>
  slideWidth + RAFFLE_FEATURED_SLIDE_GAP;

test("raffle featured slide width uses layout width not full screen", () => {
  assert.equal(resolveRaffleFeaturedSlideWidth(390), 358);
  assert.equal(resolveRaffleFeaturedSlideWidth(768), 736);
  assert.equal(resolveRaffleFeaturedSlideWidth(1024), 992);
});

test("raffle featured slide width on centered tablet layout", () => {
  const layoutWidth = 720;
  const slideWidth = resolveRaffleFeaturedSlideWidth(layoutWidth);
  assert.equal(slideWidth, 688);
  assert.equal(resolveRaffleFeaturedSnapInterval(slideWidth), 700);
});

test("raffle featured slide width never negative", () => {
  assert.equal(resolveRaffleFeaturedSlideWidth(0), 0);
});
