import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT = join(ROOT, "../client/src");

const readMobile = (p) => readFileSync(join(ROOT, p), "utf8");
const readClient = (p) => readFileSync(join(CLIENT, p), "utf8");

test("profile chrome: surfaces r24, section gap 6, avatar 72, banner H/r", () => {
  const layout = readMobile("shared/lib/guestProfileLayout.ts");
  const styles = readMobile("shared/theme/profileChromeStyles.ts");
  const pageCss = readClient("pages/my-profile/ui/MyProfilePage.css");

  assert.match(pageCss, /--my-profile-section-gap:\s*6px/);
  assert.match(pageCss, /--modal-avatar-lead-size:\s*4\.5rem/);
  assert.match(pageCss, /--modal-profile-banner-radius:\s*24px/);
  assert.match(pageCss, /--modal-profile-banner-height-mult:\s*3/);

  assert.match(layout, /MY_PROFILE_SECTION_GAP = 6/);
  assert.match(layout, /infoSectionRadius: 24/);
  assert.match(styles, /PROFILE_AVATAR_SIZE = 72/);
  assert.match(styles, /PROFILE_BANNER_HEIGHT = PROFILE_AVATAR_SIZE \* 3/);
  assert.match(styles, /PROFILE_BANNER_RADIUS = 24/);
});

test("profile sidebar title: web 1.12rem → mobile 17.92", () => {
  const layout = readMobile("shared/lib/guestProfileLayout.ts");
  const styles = readMobile("shared/theme/profileChromeStyles.ts");
  const pageCss = readClient("pages/my-profile/ui/MyProfilePage.css");

  assert.match(pageCss, /\.my-profile-page__title \{[\s\S]*font-size:\s*1\.12rem/);
  assert.match(layout, /titleFontSize: 17\.92/);
  assert.match(styles, /fontSize: S\.titleFontSize/);
});

test("guest column maxW 420 + hero r 32", () => {
  const layout = readMobile("shared/lib/guestProfileLayout.ts");
  const guestCss = readClient("pages/my-profile/ui/GuestProfilePanel.css");
  const heroCss = readClient("shared/ui/AuthHeroBanner/AuthHeroBanner.css");

  assert.match(guestCss, /--guest-profile-column-max:\s*420px/);
  assert.match(heroCss, /border-radius:\s*32px/);
  assert.match(layout, /columnMaxWidth: 420/);
  assert.match(layout, /heroRadius: 32/);
});

test("theme toggle both; WebPush web-only; mobile remote push registration", () => {
  const me = readMobile("app/(tabs)/me.tsx");
  const webPage = readClient("pages/my-profile/ui/MyProfilePage.jsx");
  const push = readMobile(
    "features/push-notifications/model/useRemotePushRegistration.ts",
  );
  const runtime = readMobile("features/app-runtime/ui/AppRuntimeSync.tsx");

  assert.match(me, /ThemePreferenceToggle/);
  assert.match(webPage, /ThemePreferenceToggle/);
  assert.match(webPage, /WebPushSettingsToggle/);
  assert.doesNotMatch(me, /WebPushSettingsToggle/);
  assert.match(push, /useRemotePushRegistration/);
  assert.match(runtime, /useRemotePushRegistration/);
});

test("WEB_ONLY services stripped from mobile nav; hub sections remain", () => {
  const nav = readMobile("features/profile-hub/model/buildProfileNavGroups.ts");
  const deep = readMobile("features/deep-linking/lib/resolveWebPathToMobileRoute.ts");

  assert.match(nav, /safe-deal/);
  assert.match(nav, /delivery-payment/);
  assert.match(nav, /onec-integration/);
  assert.match(nav, /courier-overview/);
  assert.match(nav, /"courier"/);
  assert.match(nav, /wishlist/);
  assert.match(nav, /my-orders/);
  assert.match(nav, /my-sales/);
  assert.match(nav, /advertising/);
  assert.match(nav, /premium/);
  assert.match(deep, /WEB_ONLY_PATHS/);
  assert.match(deep, /\/profile\/onec-integration/);
  assert.match(deep, /\/profile\/delivery-payment/);
  assert.match(deep, /\/become-courier/);
  assert.match(deep, /\/courier-overview/);
});
