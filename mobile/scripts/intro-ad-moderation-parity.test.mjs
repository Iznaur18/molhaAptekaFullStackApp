import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("intro ad moderation page mirrors web hub chrome and filters", () => {
  const page = readMobileFile("features/intro-ad-moderation-page/ui/IntroAdModerationPage.tsx");
  const styles = readMobileFile("shared/theme/introAdModerationPageStyles.ts");

  assert.match(page, /ProfileMobileSectionToggle/);
  assert.match(page, /ProfileMobileNavSheet/);
  assert.match(page, /contentPaddingBottom/);
  assert.match(page, /IntroAdModerationPageOverview/);
  assert.match(page, /IntroAdModerationPageToolbar/);
  assert.match(page, /summarizeIntroAdModerationHub/);
  assert.match(page, /filterPendingModerationCampaigns/);
  assert.match(page, /buildModerationCampaignRowId/);
  assert.match(page, /attentionOnly/);
  assert.match(page, /expandedIds/);
  assert.match(page, /EXPAND_ALL/);
  assert.match(page, /COLLAPSE_ALL/);
  assert.match(page, /usePendingSiteHeaderBannerCampaignsQuery/);
  assert.match(page, /usePendingSellerPersonalCategoryCampaignsQuery/);
  assert.match(page, /staffCancelMutation/);
  assert.match(page, /previewIntro/);
  assert.match(page, /activeSectionId="intro-ad-moderation"/);
  assert.match(page, /TAB_INTRO_AD_MODERATION/);
  assert.doesNotMatch(page, /StaffModerationActions/);
  assert.doesNotMatch(page, /staffQueueStyles/);

  assert.match(styles, /overviewTile/);
  assert.match(styles, /sectionChip/);
  assert.match(styles, /listActions/);
});

test("intro ad moderation campaign card supports collapsible queue rows", () => {
  const card = readMobileFile("entities/intro-ad/ui/IntroAdModerationCampaignCard.tsx");

  assert.match(card, /ModerationCampaignCollapsibleFrame/);
  assert.match(card, /collapsible/);
  assert.match(card, /REJECT_REASON_LABEL/);
  assert.match(card, /PREVIEW/);
  assert.match(card, /STAFF_CANCEL/);
  assert.match(card, /SUBMITTED_LABEL/);
});

test("intro ad moderation sub-sections support attention filter and expand state", () => {
  const bannerSection = readMobileFile(
    "features/intro-ad-moderation-page/ui/SiteHeaderBannerCampaignModerationSection.tsx",
  );
  const personalSection = readMobileFile(
    "features/intro-ad-moderation-page/ui/SellerPersonalCategoryCampaignModerationSection.tsx",
  );

  assert.match(bannerSection, /attentionOnly/);
  assert.match(bannerSection, /expandedIds/);
  assert.match(bannerSection, /collapsible/);
  assert.match(personalSection, /attentionOnly/);
  assert.match(personalSection, /expandedIds/);
  assert.match(personalSection, /collapsible/);
});

test("intro ad moderation ui copy matches web page", () => {
  const copy = readMobileFile("shared/config/appUiCopy.ts");

  assert.match(copy, /OVERVIEW_PENDING: "На модерации"/);
  assert.match(copy, /SECTION_FILTER_BANNER: "Баннер"/);
  assert.match(copy, /EXPAND_ALL: "Развернуть все"/);
  assert.match(copy, /ATTENTION_FILTER_HINT:/);
});
