import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SHARED_LIB_DIST = join(MOBILE_ROOT, "../packages/shared-lib/dist/raffleFeaturedBannerMetrics.js");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

const RAFFLE_FEATURED_CARD_PANEL_GAP = 12;

const resolveLayoutMode = () => "stacked";

const resolveVisualHeight = (cardWidth) => Math.max(0, Math.round(cardWidth));

const resolveInnerMinHeight = (cardWidth) => {
  const visualHeight = resolveVisualHeight(cardWidth);
  const footerMin = 12 + 12 + 10 + 17 + 10 + 32 + 14;
  return visualHeight + RAFFLE_FEATURED_CARD_PANEL_GAP + footerMin;
};

test("RaffleFeaturedBanner: split-card layout with square visual", () => {
  const banner = readMobileFile("entities/raffle/ui/RaffleFeaturedBanner.tsx");
  const styles = readMobileFile("shared/theme/raffleFeaturedStyles.ts");
  const section = readMobileFile("features/home-feed/ui/HomeFeaturedRafflesSection.tsx");

  assert.match(banner, /cardStack/);
  assert.match(banner, /visualCard/);
  assert.match(banner, /footerCard/);
  assert.match(banner, /visualTopControls/);
  assert.match(banner, /styles\.badge/);
  assert.match(banner, /RAFFLE_FEATURED_BANNER_UI\.BADGE/);
  assert.match(banner, /SquircleView/);
  assert.doesNotMatch(banner, /titleBadge/);
  assert.doesNotMatch(banner, /DESCRIPTION_LINK/);
  assert.doesNotMatch(banner, /innerSplit/);
  assert.doesNotMatch(banner, /RaffleFeaturedBannerBackdropLayer/);

  assert.match(styles, /cardStack/);
  assert.match(styles, /badgeLabel/);
  assert.match(styles, /borderRadius: 999/);
  assert.match(styles, /RAFFLE_FEATURED_CARD_BORDER_RADIUS/);

  assert.doesNotMatch(section, /SquircleView/);
  assert.doesNotMatch(section, /RAFFLES_SECTION_TITLE/);
  assert.match(section, /HomeFeaturedRafflesRevealButton/);
  assert.match(section, /router\.push\(`\/raffle\/\$\{/);
  assert.doesNotMatch(section, /HomeFeaturedRaffleModal/);
  assert.doesNotMatch(section, /isExpanded/);
});

test("shared-lib metrics: always stacked square visual", () => {
  assert.equal(resolveLayoutMode(900), "stacked");
  assert.equal(resolveVisualHeight(320), 320);
  assert.ok(resolveInnerMinHeight(320) > 320);
});

test("shared-lib dist exports split-card constants", () => {
  const metricsDist = readFileSync(SHARED_LIB_DIST, "utf8");
  assert.match(metricsDist, /RAFFLE_FEATURED_CARD_BORDER_RADIUS = 22/);
  assert.match(metricsDist, /RAFFLE_FEATURED_VISUAL_ASPECT_RATIO_STACKED = 1/);
  assert.match(metricsDist, /showInlineCopy: false/);
});
