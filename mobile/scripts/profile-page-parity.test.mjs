import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT = join(ROOT, "../client/src");

const readMobile = (p) => readFileSync(join(ROOT, p), "utf8");
const readClient = (p) => readFileSync(join(CLIENT, p), "utf8");

test("profile overview matches web guest + phone layout tokens", () => {
  const layout = readMobile("shared/lib/guestProfileLayout.ts");
  const styles = readMobile("shared/theme/profileChromeStyles.ts");
  const profile = readMobile("app/(tabs)/me.tsx");
  const overview = readMobile("features/profile-tab/ui/ProfileTabOverviewSection.tsx");
  const shell = readMobile("features/profile-tab/ui/ProfileAccountShell.tsx");
  const guestCss = readClient("pages/my-profile/ui/GuestProfilePanel.css");
  const heroCss = readClient("shared/ui/AuthHeroBanner/AuthHeroBanner.css");
  const pageCss = readClient("pages/my-profile/ui/MyProfilePage.css");

  assert.match(guestCss, /--guest-profile-column-max:\s*420px/);
  assert.match(heroCss, /border-radius:\s*32px/);
  assert.match(pageCss, /--my-profile-section-gap:\s*6px/);
  assert.match(pageCss, /border-radius:\s*20px/);
  assert.match(pageCss, /height:\s*2\.125rem/);

  assert.match(layout, /columnMaxWidth: 420/);
  assert.match(layout, /heroRadius: 32/);
  assert.match(layout, /MY_PROFILE_SECTION_GAP = 6/);
  assert.match(layout, /shareRowMarginTop: 0/);
  assert.match(layout, /notificationsBtnHeight: 34/);
  assert.match(layout, /storefrontBtnGap: 6\.4/);
  assert.match(layout, /sectionToggleRadius: 20/);
  assert.match(layout, /infoMarginTop: 0/);
  assert.match(layout, /infoSectionsGap: MY_PROFILE_SECTION_GAP/);
  assert.match(layout, /infoSectionRadius: 24/);
  assert.match(layout, /mainGap: MY_PROFILE_SECTION_GAP/);
  assert.match(layout, /MY_PROFILE_SIDEBAR_LAYOUT/);
  assert.match(layout, /headPaddingBottom: 11/);

  assert.match(styles, /sidebarHead:/);
  assert.match(styles, /headingSidebar:/);
  assert.match(styles, /borderRadius: S\.radius/);
  assert.match(styles, /mainColumnContent:/);
  assert.match(styles, /PROFILE_BANNER_MARGIN_BOTTOM = 0/);
  assert.match(styles, /gap: O\.mainGap/);
  assert.match(styles, /gap: O\.storefrontBtnGap/);
  assert.match(styles, /borderRadius: theme\.radius\.input/);
  assert.match(styles, /marginTop: 0/);
  assert.match(styles, /marginBottom: 0/);
  assert.doesNotMatch(styles, /borderBottomLeftRadius:\s*32/);
  assert.doesNotMatch(styles, /guestContent:/);

  assert.match(shell, /contentPaddingHorizontal/);
  assert.match(shell, /paddingHorizontal: contentPaddingHorizontal/);
  assert.doesNotMatch(shell, /styles\.shellPad/);

  assert.match(profile, /styles\.guestColumn/);
  assert.match(profile, /ProfileAccountShell/);
  assert.match(profile, /overviewFooter/);
  assert.doesNotMatch(profile, /profileContentStyle/);
  assert.doesNotMatch(profile, /guestContent/);

  assert.match(overview, /styles\.infoPanel/);
});

test("profile guest copy matches web AUTH_UI / LEGAL_UI", () => {
  const mobileCopy = readMobile("shared/config/appUiCopy.ts");
  const webAuth = readClient("shared/config/copy/auth.js");
  const profile = readMobile("app/(tabs)/me.tsx");
  const webGuest = readClient("pages/my-profile/ui/GuestProfilePanel.jsx");

  assert.match(webAuth, /PROFILE_TITLE: "Профиль"/);
  assert.match(webAuth, /GUEST_STATUS: "Вы не вошли в аккаунт"/);
  assert.match(webAuth, /GUEST_PROFILE_ACTION_BUTTON: "Перейти"/);
  assert.match(mobileCopy, /PROFILE_TITLE: "Профиль"/);
  assert.match(mobileCopy, /GUEST_STATUS: "Вы не вошли в аккаунт"/);
  assert.match(mobileCopy, /GUEST_PROFILE_ACTION_BUTTON: "Перейти"/);

  assert.match(profile, /AUTH_UI\.PROFILE_TITLE/);
  assert.match(profile, /AUTH_UI\.GUEST_STATUS/);
  assert.match(profile, /AUTH_UI\.GUEST_PROFILE_ACTION_BUTTON/);
  assert.match(profile, /LEGAL_UI\.PRIVACY_LINK/);
  assert.match(webGuest, /AUTH_UI\.GUEST_PROFILE_ACTION_BUTTON/);
  assert.match(webGuest, /LEGAL_UI\.PRIVACY_LINK/);
});
