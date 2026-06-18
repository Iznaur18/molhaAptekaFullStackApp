import assert from "node:assert/strict";
import { test } from "node:test";

const SCREEN_CONTENT_PADDING_HORIZONTAL = 8;
const RAFFLE_FEATURED_SLIDE_GAP = 12;

// Mirror of useRaffleFeaturedSlideLayout.ts (keep in sync)
const resolveRaffleFeaturedSlideWidth = (layoutWidth) =>
  Math.max(0, layoutWidth - SCREEN_CONTENT_PADDING_HORIZONTAL * 2);

const resolveRaffleFeaturedSnapInterval = (slideWidth) =>
  slideWidth + RAFFLE_FEATURED_SLIDE_GAP;

test("raffle featured slide width uses layout width not full screen", () => {
  assert.equal(resolveRaffleFeaturedSlideWidth(390), 374);
  assert.equal(resolveRaffleFeaturedSlideWidth(768), 752);
  assert.equal(resolveRaffleFeaturedSlideWidth(1024), 1008);
});

test("raffle featured slide width on centered tablet layout", () => {
  const layoutWidth = 720;
  const slideWidth = resolveRaffleFeaturedSlideWidth(layoutWidth);
  assert.equal(slideWidth, 704);
  assert.equal(resolveRaffleFeaturedSnapInterval(slideWidth), 716);
});

test("raffle featured slide width never negative", () => {
  assert.equal(resolveRaffleFeaturedSlideWidth(0), 0);
});
