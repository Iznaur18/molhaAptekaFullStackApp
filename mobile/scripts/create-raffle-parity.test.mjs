import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("create raffle page mirrors web modal form and hub chrome", () => {
  const page = readMobileFile("features/create-raffle-page/ui/CreateRafflePage.tsx");
  const formBody = readMobileFile("features/create-raffle-page/ui/CreateRaffleFormBody.tsx");
  const styles = readMobileFile("shared/theme/createRafflePageStyles.ts");

  assert.match(page, /ProfileMobileSectionToggle/);
  assert.match(page, /ProfileMobileNavSheet/);
  assert.match(page, /contentPaddingBottom/);
  assert.match(page, /CreateRaffleFormBody/);
  assert.match(page, /activeSectionId="create-raffle"/);
  assert.match(page, /TAB_CREATE_RAFFLE/);
  assert.doesNotMatch(page, /sellerFlowStyles/);

  assert.match(formBody, /CreateRaffleFormSection/);
  assert.match(formBody, /SECTION_BASIC/);
  assert.match(formBody, /SECTION_PRIZE/);
  assert.match(formBody, /SECTION_CONDITIONS/);
  assert.match(formBody, /step\?:/);
  assert.match(formBody, /showFooter\?:/);
  assert.match(page, /CreateRaffleWizardProgress/);
  assert.match(page, /CREATE_RAFFLE_WIZARD_STEPS/);
  assert.match(page, /BTN_NEXT/);

  assert.match(styles, /sectionTitle/);
  assert.match(styles, /actionSoft/);
  assert.match(styles, /previewFrame/);
  assert.match(styles, /wizardProgress/);
});

test("create raffle modal mirrors web edit flow", () => {
  const modal = readMobileFile("features/create-raffle-page/ui/CreateRaffleModal.tsx");
  const formBody = readMobileFile("features/create-raffle-page/ui/CreateRaffleFormBody.tsx");
  const webModal = readFileSync(
    join(MOBILE_ROOT, "../client/src/entities/raffle/ui/CreateRaffleModal.jsx"),
    "utf8",
  );
  const home = readMobileFile("features/home-feed/ui/HomeFeaturedRafflesSection.tsx");
  const patchMy = readMobileFile("entities/raffle/api/patchMyRaffle.ts");
  const patchStaff = readMobileFile("entities/raffle/api/patchRaffleByStaff.ts");

  assert.match(modal, /TITLE_EDIT/);
  assert.match(modal, /patchStaffMutation/);
  assert.match(modal, /patchMyMutation/);
  assert.match(modal, /useStaffApi/);
  assert.doesNotMatch(modal, /CREATE_RAFFLE_WIZARD_STEPS/);
  assert.match(formBody, /CreateRaffleFormBody/);
  assert.match(webModal, /create-raffle-modal__section/);
  assert.match(webModal, /SECTION_BASIC/);
  assert.match(webModal, /ProductWizardProgress/);
  assert.match(home, /CreateRaffleModal/);
  assert.match(home, /setEditingRaffle/);
  assert.match(home, /editUseStaffApi/);
  assert.doesNotMatch(home, /router\.push\("\/\(tabs\)\/profile"/);
  assert.match(patchMy, /\/product\/raffles\/\$\{raffleId\}/);
  assert.match(patchStaff, /\/staff/);
});

test("create raffle ui copy matches web modal", () => {
  const copy = readMobileFile("shared/config/appUiCopy.ts");

  assert.match(copy, /CREATE_RAFFLE_MODAL_UI/);
  assert.match(copy, /SECTION_BASIC/);
  assert.match(copy, /SECTION_PRIZE/);
  assert.match(copy, /SECTION_CONDITIONS/);
  assert.match(copy, /STEP_SUBTITLE_BASIC/);
  assert.match(copy, /Короткое название для баннера/);
  assert.match(copy, /После одобрения staff включите участие/);
});
