import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("intro ad moderation page mirrors web sections and hub chrome", () => {
  const page = readMobileFile("features/intro-ad-moderation-page/ui/IntroAdModerationPage.tsx");
  const styles = readMobileFile("shared/theme/introAdModerationPageStyles.ts");

  assert.match(page, /ProfileMobileSectionToggle/);
  assert.match(page, /ProfileMobileNavSheet/);
  assert.match(page, /contentPaddingBottom/);
  assert.match(page, /MANAGED_TITLE/);
  assert.match(page, /PENDING_TITLE/);
  assert.match(page, /useManagedIntroAdCampaignsQuery/);
  assert.match(page, /staffCancelMutation/);
  assert.match(page, /previewIntro/);
  assert.match(page, /activeSectionId="intro-ad-moderation"/);
  assert.match(page, /TAB_INTRO_AD_MODERATION/);
  assert.doesNotMatch(page, /StaffModerationActions/);
  assert.doesNotMatch(page, /staffQueueStyles/);

  assert.match(styles, /sectionTitle/);
});

test("intro ad moderation campaign card mirrors web actions", () => {
  const card = readMobileFile("entities/intro-ad/ui/IntroAdModerationCampaignCard.tsx");

  assert.match(card, /REJECT_REASON_LABEL/);
  assert.match(card, /PREVIEW/);
  assert.match(card, /STAFF_CANCEL/);
  assert.match(card, /SUBMITTED_LABEL/);
});

test("intro ad moderation ui copy matches web page", () => {
  const copy = readMobileFile("shared/config/appUiCopy.ts");

  assert.match(copy, /MANAGED_TITLE: "Активные и в очереди"/);
  assert.match(copy, /PENDING_TITLE: "На модерации"/);
  assert.match(copy, /REJECT_REASON_LABEL: "Причина отклонения/);
});
