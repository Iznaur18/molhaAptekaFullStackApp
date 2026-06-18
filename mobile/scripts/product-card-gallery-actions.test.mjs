import assert from "node:assert/strict";
import { test } from "node:test";

// Mirror of useProductCardMediaGalleryActions.ts (keep in sync)
const resolvePreviousSlideIndex = (index, slideCount) => {
  if (slideCount <= 1) {
    return index;
  }
  return (index - 1 + slideCount) % slideCount;
};

const resolveNextSlideIndex = (index, slideCount) => {
  if (slideCount <= 1) {
    return index;
  }
  return (index + 1) % slideCount;
};

test("resolvePreviousSlideIndex wraps at first slide", () => {
  assert.equal(resolvePreviousSlideIndex(0, 3), 2);
  assert.equal(resolvePreviousSlideIndex(1, 3), 0);
});

test("resolveNextSlideIndex wraps at last slide", () => {
  assert.equal(resolveNextSlideIndex(2, 3), 0);
  assert.equal(resolveNextSlideIndex(0, 3), 1);
});

test("single slide keeps index unchanged", () => {
  assert.equal(resolvePreviousSlideIndex(0, 1), 0);
  assert.equal(resolveNextSlideIndex(0, 1), 0);
});
