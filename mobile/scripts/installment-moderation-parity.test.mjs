import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("installment moderation page mirrors web layout and hub chrome", () => {
  const page = readMobileFile("features/installment-moderation-page/ui/InstallmentModerationPage.tsx");
  const styles = readMobileFile("shared/theme/installmentModerationPageStyles.ts");

  assert.match(page, /ProfileMobileSectionToggle/);
  assert.match(page, /ProfileMobileNavSheet/);
  assert.match(page, /contentPaddingBottom/);
  assert.match(page, /InstallmentModerationPageToolbar/);
  assert.match(page, /InstallmentModerationQueueCard/);
  assert.match(page, /removeFromQueue/);
  assert.match(page, /activeSectionId="installment-moderation"/);
  assert.match(page, /TAB_INSTALLMENT_MODERATION/);
  assert.doesNotMatch(page, /StaffModerationActions/);
  assert.doesNotMatch(page, /staffQueueStyles/);

  assert.match(styles, /planPill/);
  assert.match(styles, /borderLeftColor/);
});

test("installment moderation queue card mirrors web plans and actions", () => {
  const card = readMobileFile("entities/installment/ui/InstallmentModerationQueueCard.tsx");

  assert.match(card, /мес ×/);
  assert.match(card, /SELLER_LABEL/);
  assert.match(card, /BUYER_LABEL/);
  assert.match(card, /BUYERS_LABEL/);
  assert.match(card, /sellerLink/);
  assert.match(card, /\/user\/\[id\]/);
  assert.match(card, /MODERATION_REJECT_COMMENT/);
  assert.match(card, /MODERATION_APPROVE/);
  assert.match(card, /MODERATION_REJECT/);
});

test("installment moderation ui copy matches web page", () => {
  const copy = readMobileFile("shared/config/appUiCopy.ts");

  assert.match(copy, /COUNT_PROGRAMS: \(count: number\) => `\$\{count\} программ`/);
  assert.match(copy, /MODERATION_REJECT_COMMENT: "Комментарий \(необязательно\)"/);
});
