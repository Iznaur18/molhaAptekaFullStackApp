import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("seller personal category moderation page mirrors web queue and hub chrome", () => {
  const page = readMobileFile(
    "features/seller-personal-category-moderation-page/ui/SellerPersonalCategoryModerationPage.tsx",
  );
  const styles = readMobileFile("shared/theme/sellerPersonalCategoryModerationPageStyles.ts");

  assert.match(page, /ProfileMobileSectionToggle/);
  assert.match(page, /ProfileMobileNavSheet/);
  assert.match(page, /contentPaddingBottom/);
  assert.match(page, /SellerPersonalCategoryCampaignModerationSection/);
  assert.match(page, /useManagedSellerPersonalCategoryCampaignsQuery/);
  assert.doesNotMatch(page, /removeFromQueue/);
  assert.match(page, /activeSectionId="seller-personal-category-moderation"/);
  assert.match(page, /TAB_SELLER_PERSONAL_CATEGORY_MODERATION/);
  assert.doesNotMatch(page, /StaffModerationActions/);
  assert.doesNotMatch(page, /staffQueueStyles/);

  assert.match(styles, /stateError/);
});

test("seller personal category moderation campaign card mirrors web", () => {
  const card = readMobileFile(
    "entities/seller-personal-category/ui/SellerPersonalCategoryModerationCampaignCard.tsx",
  );

  assert.match(card, /SELLER_LABEL/);
  assert.match(card, /REJECT_REASON_PLACEHOLDER/);
  assert.match(card, /resolveUploadedMediaUrl/);
  assert.match(card, /formatSellerPersonalCategoryCampaignSummary/);
  assert.match(card, /STAFF_UNPUBLISH/);
  assert.match(card, /STAFF_DELETE/);
  assert.match(card, /mode: "pending" \| "managed"/);
});

test("seller personal category moderation ui copy matches web page", () => {
  const copy = readMobileFile("shared/config/appUiCopy.ts");

  assert.match(copy, /TITLE: "Личные категории"/);
  assert.match(copy, /APPROVE_FALLBACK: "Не удалось одобрить заявку"/);
  assert.match(copy, /REJECT_FALLBACK: "Не удалось отклонить заявку"/);
  assert.match(copy, /STAFF_UNPUBLISH:/);
  assert.match(copy, /STAFF_DELETE:/);
  assert.match(copy, /MANAGED_TITLE:/);
});
