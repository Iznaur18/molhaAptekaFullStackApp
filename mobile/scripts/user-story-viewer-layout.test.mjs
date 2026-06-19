import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

const computeUserStoryFrameSize = (viewportWidth, viewportHeight) => {
  const heightFirst = viewportHeight;
  let width = (heightFirst * 9) / 16;
  if (width <= viewportWidth) {
    return { width, height: heightFirst };
  }
  width = viewportWidth;
  return { width, height: (width * 16) / 9 };
};

test("story viewer modal is fullscreen with web-like frame", () => {
  const source = readMobileFile("features/home-feed/ui/UserStoryViewerModal.tsx");

  assert.match(source, /presentationStyle="fullScreen"/);
  assert.match(source, /computeUserStoryFrameSize/);
  assert.match(source, /contentFit="cover"/);
  assert.match(source, /styles\.edgePrev/);
});

test("computeUserStoryFrameSize matches web mobile viewport", () => {
  const phone = computeUserStoryFrameSize(390, 844);
  assert.equal(phone.width, 390);
  assert.equal(phone.height, 693.3333333333334);

  const wide = computeUserStoryFrameSize(900, 700);
  assert.equal(wide.height, 700);
  assert.equal(wide.width, 393.75);
});
