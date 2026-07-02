import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("raffle seller overview mirrors web panel and manage actions", () => {
  const overview = readMobileFile("features/profile-overview/ui/RaffleSellerOverview.tsx");
  const styles = readMobileFile("shared/theme/raffleSellerOverviewStyles.ts");

  assert.match(overview, /RaffleManageActions/);
  assert.match(overview, /CreateRaffleModal/);
  assert.match(overview, /setEditingRaffle/);
  assert.match(overview, /RAFFLE_MANAGE_UI\.DELETE_CONFIRM_OWNER/);
  assert.match(overview, /STATUS_ACTIVE/);
  assert.doesNotMatch(overview, /AppButton/);
  assert.doesNotMatch(overview, /router\.push/);
  assert.doesNotMatch(overview, /ScreenLoadingState/);

  assert.match(styles, /accentPurpleSoft/);
  assert.match(styles, /accentPurple/);
  assert.match(styles, /warningBrownDeep/);
});

test("profile overview section no longer embeds raffle seller overview", () => {
  const section = readMobileFile("features/profile-tab/ui/ProfileTabOverviewSection.tsx");

  assert.doesNotMatch(section, /RaffleSellerOverview/);
  assert.doesNotMatch(section, /raffleSection/);
});
