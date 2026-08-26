import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("advertising page mirrors web hub chrome and balance bar", () => {
  const page = readMobileFile("features/advertising-page/ui/AdvertisingPage.tsx");
  const styles = readMobileFile("shared/theme/advertisingPageStyles.ts");

  assert.match(page, /ProfileMobileSectionToggle/);
  assert.match(page, /ProfileMobileNavSheet/);
  assert.match(page, /ProfileAccountScrollBody/);
  assert.match(page, /contentPaddingBottom/);
  assert.match(page, /heroCard/);
  assert.match(page, /PAGE_LEAD/);
  assert.match(page, /activeSectionId="advertising"/);
  assert.match(page, /TAB_ADVERTISING/);
  assert.doesNotMatch(page, /sellerFlowStyles/);

  assert.match(styles, /heroCard/);
  assert.match(styles, /cardIntro/);
  assert.match(styles, /cardCategory/);
});

test("intro ad section mirrors web card layout", () => {
  const section = readMobileFile("features/advertising-page/ui/IntroAdAdvertisingSection.tsx");

  assert.match(section, /cardHead/);
  assert.match(section, /metaItem/);
  assert.match(section, /Заявка на intro/);
  assert.match(section, /resolveIntroAdStatusPanelStyle/);
  assert.match(section, /INTRO_DURATION_BADGE/);
  assert.doesNotMatch(section, /sellerFlowStyles/);
});

test("personal category section mirrors web card layout", () => {
  const section = readMobileFile(
    "features/advertising-page/ui/PersonalCategoryAdvertisingSection.tsx",
  );

  assert.match(section, /showTariffQuote/);
  assert.match(section, /tariffSelected/);
  assert.match(section, /Заявка на личную категорию/);
  assert.match(section, /resolvePersonalCategoryStatusPanelStyle/);
});

test("advertising ui copy matches web page", () => {
  const copy = readMobileFile("shared/config/appUiCopy.ts");

  assert.match(copy, /PAGE_ARIA: "Реклама в intro"/);
  assert.match(copy, /intro-ролик/);
  assert.match(copy, /Все одобренные товары попадают/);
  assert.match(copy, /RAFFLE_ADVERTISING_PAGE_UI/);
});

test("raffle advertising section is wired on advertising page", () => {
  const page = readMobileFile("features/advertising-page/ui/AdvertisingPage.tsx");
  const section = readMobileFile("features/advertising-page/ui/RaffleAdvertisingSection.tsx");

  assert.match(page, /RaffleAdvertisingSection/);
  assert.match(section, /useUnlockRaffleCreateMutation/);
  assert.match(section, /PAY_AND_CREATE_WITH_PRICE/);
  assert.match(section, /CONTINUE_CREATE/);
  assert.match(section, /hub\/create-raffle/);
});
