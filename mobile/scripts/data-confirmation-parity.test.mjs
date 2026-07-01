import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("data confirmation page mirrors web plan panel and status blocks", () => {
  const page = readMobileFile("features/data-confirmation-page/ui/DataConfirmationPage.tsx");
  const styles = readMobileFile("shared/theme/dataConfirmationPageStyles.ts");

  assert.match(page, /ProfileMobileSectionToggle/);
  assert.match(page, /ProfileMobileNavSheet/);
  assert.match(page, /contentPaddingBottom/);
  assert.match(page, /DataConfirmationRequestModal/);
  assert.match(page, /PLAN_BENEFITS/);
  assert.match(page, /OPEN_REQUEST/);
  assert.match(page, /USER_DATA_CONFIRMATION_STATUS_PENDING/);
  assert.match(page, /data-confirmation/);
  assert.doesNotMatch(page, /formChromeStyles/);

  assert.match(styles, /planTitle/);
  assert.match(styles, /statusOk/);
  assert.match(styles, /statusPending/);
  assert.match(styles, /statusRejected/);
  assert.match(styles, /submitText/);
});

test("data confirmation ui copy matches web profile page", () => {
  const copy = readMobileFile("shared/config/appUiCopy.ts");

  assert.match(copy, /PAGE_ARIA: "Подтверждение данных"/);
  assert.match(copy, /Бейдж подтверждения у имени в каталоге/);
  assert.match(copy, /OPEN_REQUEST: "Подать заявку"/);
});
