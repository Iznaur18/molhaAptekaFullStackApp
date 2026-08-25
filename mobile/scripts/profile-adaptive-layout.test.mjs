import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT = join(ROOT, "../client/src");

const readMobile = (p) => readFileSync(join(ROOT, p), "utf8");
const readClient = (p) => readFileSync(join(CLIENT, p), "utf8");

test("profile adaptive layout matches web /me breakpoints", () => {
  const layout = readMobile("shared/lib/guestProfileLayout.ts");
  const styles = readMobile("shared/theme/profileChromeStyles.ts");
  const hook = readMobile("shared/model/useProfileAdaptiveLayout.ts");
  const profile = readMobile("app/(tabs)/profile.tsx");
  const toggle = readMobile("features/profile-tab/ui/ProfileMobileSectionToggle.tsx");
  const sheet = readMobile("features/profile-tab/ui/ProfileMobileNavSheet.tsx");
  const menu = readMobile("features/profile-hub/ui/ProfileHubMenu.tsx");
  const webConst = readClient("pages/my-profile/lib/myProfileMobileNavConstants.js");
  const webCss = readClient("pages/my-profile/ui/MyProfilePage.css");

  assert.match(webConst, /MY_PROFILE_DRAWER_LAYOUT_MAX_PX = 900/);
  assert.match(webCss, /max-width:\s*900px/);
  assert.match(webCss, /max-width:\s*640px/);

  assert.match(layout, /MY_PROFILE_DRAWER_LAYOUT_MAX_PX = 900/);
  assert.match(layout, /MY_PROFILE_PHONE_LAYOUT_MAX_PX = 640/);
  assert.match(layout, /MY_PROFILE_SIDEBAR_WIDTH = 260/);

  assert.match(hook, /isDrawerLayout/);
  assert.match(hook, /isPhoneLayout/);
  assert.match(hook, /MY_PROFILE_DRAWER_LAYOUT_MAX_PX/);

  assert.match(layout, /MY_PROFILE_LAYOUT_GAP = 16/);
  assert.match(layout, /MY_PROFILE_MAIN_GAP = 12/);
  assert.match(layout, /MY_PROFILE_SHELL_PAD_X = 16/);
  assert.match(layout, /scrollPaddingTop: 0/);

  assert.match(styles, /gap: MY_PROFILE_LAYOUT_GAP/);
  assert.match(styles, /shellPad:/);
  assert.match(styles, /paddingHorizontal: MY_PROFILE_SHELL_PAD_X/);

  assert.match(profile, /styles\.shellPad/);
  assert.match(profile, /centeredContentStyle/);
  assert.match(profile, /pageScrollContent/);
  assert.match(profile, /sidebarInner/);
  assert.doesNotMatch(
    profile.slice(profile.indexOf("isLoggedIn")),
    /<ScrollView[^>]*contentContainerStyle=\{styles\.sidebarScroll\}/,
  );
  // Authorized: один ScrollView (гость и sheet не считаем).
  const authorized = profile.slice(profile.indexOf("const overviewBlocks"));
  const scrollOpen = (authorized.match(/<ScrollView/g) ?? []).length;
  assert.equal(scrollOpen, 1);
  assert.doesNotMatch(profile, /paddingHorizontal: contentPaddingHorizontal/);
  assert.match(profile, /isDrawerLayout/);
  assert.match(profile, /variant="sidebar"/);
  assert.match(profile, /appearance=\{isPhoneLayout \? "phone" : "tablet"\}/);
  assert.match(profile, /side=\{isPhoneLayout \? "right" : "left"\}/);
  assert.match(profile, /isPhoneLayout \? \(/);

  assert.match(toggle, /appearance\?:/);
  assert.match(toggle, /"phone" \| "tablet"/);
  assert.match(sheet, /side\?:/);
  assert.match(sheet, /sheetFromLeft/);
  assert.match(menu, /"sidebar"/);
});
