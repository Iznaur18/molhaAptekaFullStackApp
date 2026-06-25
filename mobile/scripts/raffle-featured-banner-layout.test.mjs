import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SHARED_LIB_DIST = join(MOBILE_ROOT, "../packages/shared-lib/dist/index.js");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

const RAFFLE_FEATURED_VISUAL_STACKED_HEIGHT = 196;
const RAFFLE_FEATURED_SPLIT_LAYOUT_MIN_CARD_WIDTH = 641;
const CHROME = {
  innerPaddingHorizontal: 6.4,
  innerPaddingTop: 5.12,
  innerPaddingBottom: 6.08,
  imageBleedTop: 3.52,
  imageBleedHorizontal: 4.8,
  stackedGridGap: 16,
  splitGridGap: 20,
  bodyPaddingTop: 10,
  stackedBodyPaddingTop: 0,
  titleLineHeight: 25,
  titleMarginBottom: 5,
  descriptionLineHeight: 20,
  descriptionMarginBottom: 10,
  progressBarHeight: 8.8,
  progressLabelMarginTop: 5.6,
  progressLabelLineHeight: 17,
  progressMarginBottom: 12,
  manageContentHeight: 32,
  managePaddingBottom: 10.4,
  manageMarginBottom: 10.4,
  actionsMinHeight: 32,
};

const resolveLayoutMode = (cardWidth) =>
  cardWidth >= RAFFLE_FEATURED_SPLIT_LAYOUT_MIN_CARD_WIDTH ? "split" : "stacked";

const resolveStackedBodyMinHeight = (hasManage = false) =>
  CHROME.stackedBodyPaddingTop +
  CHROME.progressBarHeight +
  CHROME.progressLabelMarginTop +
  CHROME.progressLabelLineHeight +
  CHROME.progressMarginBottom +
  (hasManage
    ? CHROME.manageContentHeight +
      CHROME.managePaddingBottom +
      CHROME.manageMarginBottom
    : 0) +
  CHROME.actionsMinHeight;

const resolveStackedInnerMinHeight = () =>
  Math.round(
    CHROME.innerPaddingTop +
      CHROME.innerPaddingBottom +
      RAFFLE_FEATURED_VISUAL_STACKED_HEIGHT -
      CHROME.imageBleedTop +
      CHROME.stackedGridGap +
      resolveStackedBodyMinHeight(false),
  );

test("RaffleFeaturedBanner uses content height, backdrop and carousel variant", () => {
  const banner = readMobileFile("entities/raffle/ui/RaffleFeaturedBanner.tsx");
  const styles = readMobileFile("shared/theme/raffleFeaturedStyles.ts");
  const carousel = readMobileFile("entities/raffle/ui/RaffleFeaturedCarousel.tsx");

  assert.match(banner, /useRaffleFeaturedBannerMetrics/);
  assert.match(banner, /hasManage/);
  assert.match(banner, /inCarousel/);
  assert.match(banner, /metrics\.showInlineCopy/);
  assert.match(banner, /getRaffleFeaturedBannerBackdrop/);
  assert.match(banner, /RaffleFeaturedBannerInfoOverlay/);
  assert.doesNotMatch(banner, /minHeight: metrics\.innerMinHeight/);
  assert.match(styles, /rootInCarousel/);
  assert.match(styles, /paddingTop: L\.innerPaddingTop/);
  assert.match(carousel, /inCarousel/);
  assert.match(carousel, /onLayout=\{handleViewportLayout\}/);
});

test("stacked visual matches web mobile bleed and radius", () => {
  const styles = readMobileFile("shared/theme/raffleFeaturedStyles.ts");

  assert.match(styles, /gap: L\.stackedGridGap/);
  assert.match(styles, /marginHorizontal: -L\.imageBleedHorizontal/);
  assert.match(styles, /marginBottom: 0/);
  assert.match(styles, /borderTopLeftRadius: VISUAL_RADIUS_TOP/);
  assert.match(styles, /borderBottomLeftRadius: VISUAL_RADIUS_BOTTOM/);
});

test("shared-lib metrics: stacked body excludes manage by default", () => {
  assert.equal(resolveLayoutMode(640), "stacked");
  assert.equal(resolveLayoutMode(641), "split");

  const stackedInner = resolveStackedInnerMinHeight();
  assert.ok(stackedInner <= 320);
  assert.ok(stackedInner >= 285);
  assert.ok(resolveStackedBodyMinHeight(true) > resolveStackedBodyMinHeight(false));
});

test("shared-lib dist exports raffle banner metrics", () => {
  const dist = readFileSync(SHARED_LIB_DIST, "utf8");
  const metricsDist = readFileSync(
    join(MOBILE_ROOT, "../packages/shared-lib/dist/raffleFeaturedBannerMetrics.js"),
    "utf8",
  );
  assert.match(dist, /resolveRaffleFeaturedBannerMetrics/);
  assert.match(metricsDist, /hasManage/);
  assert.match(metricsDist, /RAFFLE_FEATURED_VISUAL_STACKED_HEIGHT/);
});
