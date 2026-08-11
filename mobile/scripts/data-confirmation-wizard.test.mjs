import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT_ROOT = join(MOBILE_ROOT, "..", "client");

const readMobile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");
const readClient = (relativePath) =>
  readFileSync(join(CLIENT_ROOT, relativePath), "utf8");

test("passport confirmation wizard has 3 steps with per-step validation", () => {
  const mobileStep = readMobile(
    "entities/user-data-confirmation/lib/validatePassportFormStep.ts",
  );
  const clientStep = readClient(
    "src/entities/user-data-confirmation/lib/validatePassportFormStep.js",
  );
  const mobileModal = readMobile(
    "features/data-confirmation-page/ui/DataConfirmationRequestModal.tsx",
  );
  const clientModal = readClient(
    "src/entities/user-data-confirmation/ui/DataConfirmationRequestModal.jsx",
  );
  const mobileCopy = readMobile("shared/config/appUiCopy.ts");
  const clientCss = readClient(
    "src/entities/user-data-confirmation/ui/DataConfirmationRequestModal.css",
  );

  assert.match(mobileStep, /PASSPORT_FORM_STEP_IDENTITY = 0/);
  assert.match(mobileStep, /PASSPORT_FORM_STEP_PASSPORT = 1/);
  assert.match(mobileStep, /PASSPORT_FORM_STEP_SELFIE = 2/);
  assert.match(clientStep, /PASSPORT_FORM_STEP_SELFIE = 2/);
  assert.match(mobileModal, /ScrollView/);
  assert.match(mobileModal, /validatePassportFormStep/);
  assert.match(mobileModal, /passportInput/);
  assert.match(mobileModal, /STEP_PASSPORT/);
  assert.match(mobileModal, /animationType="fade"/);
  assert.match(mobileModal, /useDataConfirmationRequestModalStyles/);
  assert.doesNotMatch(mobileModal, /ModalSheetGradientBackdrop/);
  assert.doesNotMatch(mobileModal, /animationType="slide"/);
  assert.match(clientModal, /validatePassportFormStep/);
  assert.match(clientModal, /STEP_SELFIE/);
  assert.match(mobileCopy, /STEP_PROGRESS:/);
  assert.match(mobileCopy, /NEXT: "Далее"/);
  assert.match(clientCss, /background: var\(--iz-color-bg\)/);
  assert.match(clientCss, /data-confirmation-modal__step-title/);

  const mobileMask = readMobile(
    "entities/user-data-confirmation/lib/passportDateInputMask.ts",
  );
  assert.match(mobileMask, /maskPassportDateInput/);
  assert.match(mobileMask, /parsePassportDateInputToIso/);
  assert.match(mobileModal, /maskPassportDateInput/);
  assert.match(mobileModal, /maskPassportDepartmentCodeInput/);
  assert.match(mobileModal, /PLACEHOLDER_DATE/);
  assert.match(mobileCopy, /PLACEHOLDER_DATE: "ДД\.ММ\.ГГГГ"/);

  const deptMask = readMobile(
    "entities/user-data-confirmation/lib/passportDepartmentCodeInputMask.ts",
  );
  assert.match(deptMask, /maskPassportDepartmentCodeInput/);
  assert.match(deptMask, /\$\{left\}-\$\{right\}/);
});
