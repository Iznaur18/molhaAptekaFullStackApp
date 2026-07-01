import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("raffles staff page mirrors web live queue and hub chrome", () => {
  const page = readMobileFile("features/raffles-staff-page/ui/RafflesStaffPage.tsx");
  const styles = readMobileFile("shared/theme/rafflesStaffPageStyles.ts");

  assert.match(page, /ProfileMobileSectionToggle/);
  assert.match(page, /ProfileMobileNavSheet/);
  assert.match(page, /contentPaddingBottom/);
  assert.match(page, /RafflesStaffLiveRow/);
  assert.match(page, /RafflesStaffPendingRow/);
  assert.match(page, /LIVE_SECTION_TITLE/);
  assert.match(page, /QUEUE_TITLE/);
  assert.match(page, /removePendingRow/);
  assert.match(page, /deleteStaffMutation/);
  assert.match(page, /CreateRaffleModal/);
  assert.match(page, /setEditingRaffle/);
  assert.match(page, /useStaffApi/);
  assert.match(page, /onEdit/);
  assert.match(page, /activeSectionId="raffles"/);
  assert.match(page, /TAB_RAFFLES/);
  assert.doesNotMatch(page, /StaffModerationActions/);
  assert.doesNotMatch(page, /staffQueueStyles/);

  assert.match(styles, /rowLive/);
});

test("raffles staff pending row mirrors web actions", () => {
  const row = readMobileFile("entities/raffle/ui/RafflesStaffPendingRow.tsx");

  assert.match(row, /RafflesStaffRowMedia/);
  assert.match(row, /REJECT/);
  assert.match(row, /DELETE/);
});

test("raffles staff ui copy matches web page", () => {
  const copy = readMobileFile("shared/config/appUiCopy.ts");

  assert.match(copy, /QUEUE_TITLE: "Заявки на модерацию"/);
  assert.match(copy, /TITLE: "Розыгрыши"/);
});
