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
  const profile = readMobile("app/(tabs)/me.tsx");
  const shell = readMobile("features/profile-tab/ui/ProfileAccountShell.tsx");
  const hub = readMobile("app/(tabs)/hub/[section].tsx");
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
  assert.match(layout, /resolveProfileHubMainReservedWidth/);
  assert.match(layout, /MY_PRODUCTS_PAGE_LAYOUT/);
  assert.match(layout, /stackGap: MY_PROFILE_MAIN_GAP/);

  assert.match(styles, /gap: MY_PROFILE_LAYOUT_GAP/);
  assert.match(styles, /shellPad:/);
  assert.match(styles, /paddingHorizontal: MY_PROFILE_SHELL_PAD_X/);

  assert.match(shell, /styles\.shellPad/);
  assert.match(shell, /centeredContentStyle/);
  assert.match(shell, /pageScrollContent/);
  assert.match(shell, /sidebarInner/);
  assert.match(shell, /variant="sidebar"/);
  assert.doesNotMatch(shell, /sidebarScroll/);

  assert.match(profile, /ProfileAccountShell/);
  assert.match(profile, /mode="overview"/);
  assert.match(hub, /ProfileAccountShell/);
  assert.match(hub, /mode="hub"/);

  assert.doesNotMatch(profile, /paddingHorizontal: contentPaddingHorizontal/);
  assert.match(profile, /isDrawerLayout/);
  assert.match(profile, /appearance=\{isPhoneLayout \? "phone" : "tablet"\}/);
  assert.match(profile, /side=\{isPhoneLayout \? "right" : "left"\}/);
  assert.match(profile, /isPhoneLayout \? \(/);

  assert.match(toggle, /appearance\?:/);
  assert.match(toggle, /"phone" \| "tablet"/);
  assert.match(toggle, /if \(!isDrawerLayout\)/);
  assert.match(sheet, /side\?:/);
  assert.match(sheet, /sheetFromLeft/);
  assert.match(menu, /"sidebar"/);
});
