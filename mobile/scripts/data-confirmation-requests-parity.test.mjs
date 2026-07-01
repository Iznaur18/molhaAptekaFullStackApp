import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("data confirmation requests page mirrors web hub chrome and queue", () => {
  const page = readMobileFile(
    "features/data-confirmation-requests-page/ui/DataConfirmationRequestsPage.tsx",
  );
  const styles = readMobileFile("shared/theme/dataConfirmationRequestsPageStyles.ts");

  assert.match(page, /ProfileMobileSectionToggle/);
  assert.match(page, /ProfileMobileNavSheet/);
  assert.match(page, /contentPaddingBottom/);
  assert.match(page, /DataConfirmationRequestCard/);
  assert.match(page, /removeRequestRow/);
  assert.match(page, /activeSectionId="data-confirmation-requests"/);
  assert.match(page, /TAB_DATA_CONFIRMATION/);
  assert.doesNotMatch(page, /StaffModerationActions/);
  assert.doesNotMatch(page, /staffQueueStyles/);

  assert.match(styles, /selfieImage/);
});

test("data confirmation request card mirrors web passport and actions", () => {
  const card = readMobileFile("entities/user-data-confirmation/ui/DataConfirmationRequestCard.tsx");

  assert.match(card, /UserPremiumDisplayName/);
  assert.match(card, /formatPassportFullName/);
  assert.match(card, /PASSPORT_SELFIE_SECTION/);
  assert.match(card, /OPEN_APPLICANT/);
  assert.match(card, /STAFF_NOTE_MIN_WORDS/);
  assert.match(card, /ACTION_APPROVE/);
  assert.match(card, /ACTION_REJECT/);
});

test("data confirmation staff ui copy matches web queue page", () => {
  const copy = readMobileFile("shared/config/appUiCopy.ts");

  assert.match(copy, /OPEN_APPLICANT: "Профиль заявителя"/);
  assert.match(copy, /PASSPORT_SELFIE_OPEN: "Открыть фото в полном размере"/);
});
