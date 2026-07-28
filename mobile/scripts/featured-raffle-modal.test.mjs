import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("buildFeaturedRaffleProgress: shared label helper used by banner and modal card", () => {
  const helper = readMobileFile("entities/raffle/lib/buildFeaturedRaffleProgressLabel.ts");
  const banner = readMobileFile("entities/raffle/ui/RaffleFeaturedBanner.tsx");
  const card = readMobileFile("entities/raffle/ui/FeaturedRaffleModalCard.tsx");

  assert.match(helper, /export const buildFeaturedRaffleProgress/);
  assert.match(helper, /RAFFLE_FEATURED_BANNER_UI\.PROGRESS/);
  assert.match(helper, /RAFFLE_FEATURED_BANNER_UI\.REMAINING/);
  assert.match(banner, /buildFeaturedRaffleProgress/);
  assert.match(card, /buildFeaturedRaffleProgress/);
  assert.match(card, /styles\.title/);
  assert.match(card, /styles\.description/);
  assert.doesNotMatch(card, /OPEN_PRODUCTS/);
});

test("HomeFeaturedRaffleModal: bottom sheet slide-up, squircle, sticky CTA", () => {
  const modal = readMobileFile("features/home-feed/ui/HomeFeaturedRaffleModal.tsx");
  const styles = readMobileFile("shared/theme/raffleFeaturedStyles.ts");

  assert.match(modal, /animationType="none"/);
  assert.match(modal, /transparent/);
  assert.match(modal, /onRequestClose=\{onClose\}/);
  assert.match(modal, /useAdminEditModalAnimation/);
  assert.match(modal, /SquircleView/);
  assert.match(modal, /FEATURED_RAFFLE_MODAL_ANIMATION/);
  assert.match(modal, /dialogHeight/);
  assert.match(modal, /height: dialogHeight/);
  assert.match(modal, /styles\.footer/);
  assert.match(modal, /styles\.footerButton/);
  assert.match(modal, /styles\.footerClose/);
  assert.match(modal, /OPEN_PRODUCTS/);
  assert.match(modal, /onClose\(\)/);
  assert.match(styles, /FEATURED_RAFFLE_MODAL_BACKDROP/);
  assert.match(styles, /FEATURED_RAFFLE_MODAL_ANIMATION/);
  assert.match(styles, /enterMs: 420/);
  assert.match(styles, /justifyContent: "flex-end"/);
  assert.match(styles, /useFeaturedRaffleModalCardStyles/);
  assert.match(styles, /footerButton:/);
});
