import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT = join(ROOT, "..", "client");
const CONTRACT = join(ROOT, "..", "contract");

const read = (from, relativePath) => readFileSync(join(from, relativePath), "utf8");

test("create raffle wizard: 3 steps + per-step validate (mobile)", () => {
  const steps = read(ROOT, "features/create-raffle-page/lib/createRaffleWizardSteps.ts");
  const form = read(ROOT, "features/create-raffle-page/lib/createRaffleForm.ts");
  const page = read(ROOT, "features/create-raffle-page/ui/CreateRafflePage.tsx");
  const body = read(ROOT, "features/create-raffle-page/ui/CreateRaffleFormBody.tsx");
  const progress = read(ROOT, "features/create-raffle-page/ui/CreateRaffleWizardProgress.tsx");
  const editModal = read(ROOT, "features/create-raffle-page/ui/CreateRaffleModal.tsx");
  const copy = read(ROOT, "shared/config/appUiCopy.ts");

  assert.match(steps, /CREATE_RAFFLE_WIZARD_STEPS/);
  assert.match(steps, /"basic"/);
  assert.match(steps, /"prize"/);
  assert.match(steps, /"conditions"/);
  assert.match(steps, /validateCreateRaffleFormStep/);
  assert.match(steps, /isRuRegionCode/);
  assert.match(form, /regionCode/);
  assert.match(form, /DEFAULT_VIEWER_REGION_CODE/);
  assert.match(form, /validateCreateRaffleFormStep/);
  assert.match(form, /isCreateRaffleFormDirty/);
  assert.match(body, /RuRegionSelect/);
  assert.match(body, /LABEL_REGION/);
  assert.match(page, /CreateRaffleWizardProgress/);
  assert.match(page, /validateCreateRaffleFormStep/);
  assert.match(page, /BTN_NEXT/);
  assert.match(page, /DISCARD_TITLE/);
  assert.match(page, /step=\{stepId\}/);
  assert.match(page, /showFooter=\{false\}/);
  assert.match(body, /step \?= "all"|step = "all"/);
  assert.match(progress, /WIZARD_STEP_OF/);
  assert.doesNotMatch(editModal, /CREATE_RAFFLE_WIZARD_STEPS/);
  assert.match(editModal, /CreateRaffleFormBody/);
  assert.match(copy, /STEP_SUBTITLE_BASIC/);
  assert.match(copy, /BTN_NEXT/);
});

test("create raffle wizard: create-mode only on web modal", () => {
  const webModal = read(CLIENT, "src/entities/raffle/ui/CreateRaffleModal.jsx");
  const webWizard = read(CLIENT, "src/entities/raffle/lib/createRaffleWizard.js");
  const webCopy = read(CLIENT, "src/shared/config/appUiCopy.js");

  assert.match(webWizard, /CREATE_RAFFLE_WIZARD_STEPS/);
  assert.match(webWizard, /validateCreateRaffleFormStep/);
  assert.match(webModal, /ProductWizardProgress/);
  assert.match(webModal, /ProductWizardStepHeadline/);
  assert.match(webModal, /!isEdit/);
  assert.match(webModal, /goNext/);
  assert.match(webModal, /requestClose/);
  assert.match(webModal, /isCreateRaffleFormDirty/);
  assert.match(webModal, /BTN_NEXT/);
  assert.match(webCopy, /STEP_SUBTITLE_BASIC/);
  assert.match(webCopy, /ERROR_PRIZE_IMAGE/);
});

test("create raffle wizard: instagram optional on conditions step", () => {
  const steps = read(ROOT, "features/create-raffle-page/lib/createRaffleWizardSteps.ts");
  const webWizard = read(CLIENT, "src/entities/raffle/lib/createRaffleWizard.js");
  const body = read(ROOT, "features/create-raffle-page/ui/CreateRaffleFormBody.tsx");
  const contract = read(CONTRACT, "src/raffle.js");
  const webModal = read(CLIENT, "src/entities/raffle/ui/CreateRaffleModal.jsx");

  assert.doesNotMatch(steps, /ERROR_INSTAGRAM/);
  assert.doesNotMatch(webWizard, /ERROR_INSTAGRAM/);
  assert.doesNotMatch(body, /LABEL_INSTAGRAM\} \*/);
  assert.doesNotMatch(webModal, /LABEL_INSTAGRAM\} required/);
  assert.match(contract, /value\.length === 0 \|\| isHttpUrl/);
  assert.doesNotMatch(contract, /min\(1, "Укажите ссылку на Instagram"\)/);
});

test("create raffle: block notice + withdraw pending on step 1", () => {
  const mobileNotice = read(
    ROOT,
    "features/create-raffle-page/lib/resolveCreateRaffleBlockNotice.ts",
  );
  const mobilePage = read(ROOT, "features/create-raffle-page/ui/CreateRafflePage.tsx");
  const mobileBlockUi = read(
    ROOT,
    "features/create-raffle-page/ui/CreateRaffleBlockNotice.tsx",
  );
  const mobileDelete = read(ROOT, "entities/raffle/api/deleteMyRaffle.ts");
  const webNotice = read(CLIENT, "src/entities/raffle/lib/resolveCreateRaffleBlockNotice.js");
  const webModal = read(CLIENT, "src/entities/raffle/ui/CreateRaffleModal.jsx");
  const webDelete = read(CLIENT, "src/entities/raffle/api/deleteMyRaffle.js");
  const mobileCopy = read(ROOT, "shared/config/appUiCopy.ts");
  const webCopy = read(CLIENT, "src/shared/config/appUiCopy.js");

  assert.match(mobileNotice, /pending_staff/);
  assert.match(mobileNotice, /canWithdraw: true/);
  assert.match(mobileNotice, /EXISTING_PENDING/);
  assert.match(mobileNotice, /EXISTING_IN_PROGRESS/);
  assert.match(mobilePage, /useMyRaffleQuery/);
  assert.match(mobilePage, /CreateRaffleBlockNotice/);
  assert.match(mobilePage, /WITHDRAW_CONFIRM/);
  assert.match(mobilePage, /deleteMyMutation/);
  assert.match(mobilePage, /isCreateBlocked/);
  assert.match(mobileBlockUi, /BTN_WITHDRAW/);
  assert.match(mobileDelete, /\/product\/raffles\/my\/\$\{raffleId\}/);
  assert.match(webNotice, /pending_staff/);
  assert.match(webNotice, /resolveCreateRaffleBlockNotice/);
  assert.match(webModal, /useMyRaffleQuery/);
  assert.match(webModal, /blockNotice/);
  assert.match(webModal, /handleWithdraw/);
  assert.match(webModal, /BTN_WITHDRAW/);
  assert.match(webDelete, /\/product\/raffles\/my\/\$\{raffleId\}/);
  assert.match(mobileCopy, /BTN_WITHDRAW/);
  assert.match(webCopy, /EXISTING_PENDING/);
});
