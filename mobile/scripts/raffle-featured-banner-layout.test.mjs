import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SHARED_LIB_DIST = join(MOBILE_ROOT, "../packages/shared-lib/dist/index.js");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

// Mirror of @izibuy/shared-lib raffleFeaturedBannerMetrics (keep in sync)
const RAFFLE_FEATURED_VISUAL_ASPECT_RATIO_STACKED = 0.52;
const RAFFLE_FEATURED_VISUAL_MIN_HEIGHT = 160;
const RAFFLE_FEATURED_SPLIT_LAYOUT_MIN_CARD_WIDTH = 641;
const CHROME = {
  innerPaddingHorizontal: 6.4,
  innerPaddingTop: 5,
  innerPaddingBottom: 6,
  imageBleedTop: 3.5,
  splitGridGap: 20,
};

const resolveLayoutMode = (cardWidth) =>
  cardWidth >= RAFFLE_FEATURED_SPLIT_LAYOUT_MIN_CARD_WIDTH ? "split" : "stacked";

const resolveVisualWidth = (cardWidth, layout = resolveLayoutMode(cardWidth)) => {
  if (layout === "stacked") {
    return Math.max(0, cardWidth);
  }
  const innerContentWidth = cardWidth - CHROME.innerPaddingHorizontal * 2;
  return Math.max(0, (innerContentWidth - CHROME.splitGridGap) / 2);
};

const RAFFLE_FEATURED_VISUAL_ASPECT_RATIO = 0.42;

const resolveVisualHeight = (visualWidth, layout = "stacked") => {
  const ratio =
    layout === "stacked"
      ? RAFFLE_FEATURED_VISUAL_ASPECT_RATIO_STACKED
      : RAFFLE_FEATURED_VISUAL_ASPECT_RATIO;
  return Math.max(
    RAFFLE_FEATURED_VISUAL_MIN_HEIGHT,
    Math.round(Math.max(0, visualWidth) * ratio),
  );
};

test("RaffleFeaturedBanner uses shared metrics hook and cardWidth prop", () => {
  const banner = readMobileFile("entities/raffle/ui/RaffleFeaturedBanner.tsx");
  const styles = readMobileFile("shared/theme/raffleFeaturedStyles.ts");

  assert.match(banner, /useRaffleFeaturedBannerMetrics/);
  assert.match(banner, /cardWidth/);
  assert.match(banner, /metrics\.layout === "split"/);
  assert.match(banner, /RaffleFeaturedBannerBackground/);
  assert.match(banner, /innerStacked/);
  assert.match(styles, /innerStacked/);
  assert.doesNotMatch(styles, /backgroundColor: P\.accentPinkLilac/);
  assert.match(
    readMobileFile("entities/raffle/ui/RaffleFeaturedCarousel.tsx"),
    /onLayout=\{handleViewportLayout\}/,
  );
});

test("stacked visual spans full card width with bleed", () => {
  const styles = readMobileFile("shared/theme/raffleFeaturedStyles.ts");

  assert.match(styles, /visualStacked/);
  assert.match(styles, /marginHorizontal: -L\.innerPaddingHorizontal/);
});

test("shared-lib metrics: stacked vs split layout", () => {
  assert.equal(resolveLayoutMode(640), "stacked");
  assert.equal(resolveLayoutMode(641), "split");

  const stackedHeight = resolveVisualHeight(resolveVisualWidth(374, "stacked"), "stacked");
  const splitHeight = resolveVisualHeight(resolveVisualWidth(720, "split"), "split");

  assert.equal(
    stackedHeight,
    Math.max(RAFFLE_FEATURED_VISUAL_MIN_HEIGHT, Math.round(374 * 0.52)),
  );
  assert.ok(splitHeight >= RAFFLE_FEATURED_VISUAL_MIN_HEIGHT);
  assert.ok(splitHeight < stackedHeight);
});

test("shared-lib dist exports raffle banner metrics", () => {
  const dist = readFileSync(SHARED_LIB_DIST, "utf8");
  assert.match(dist, /resolveRaffleFeaturedBannerMetrics/);
});
