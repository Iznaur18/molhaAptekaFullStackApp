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
  const guestCss = readClient("pages/my-profile/ui/GuestProfilePanel.css");
  const heroCss = readClient("shared/ui/AuthHeroBanner/AuthHeroBanner.css");
  const pageCss = readClient("pages/my-profile/ui/MyProfilePage.css");

  assert.match(guestCss, /--guest-profile-column-max:\s*420px/);
  assert.match(heroCss, /border-radius:\s*32px/);
  assert.match(pageCss, /border-radius:\s*20px/);
  assert.match(pageCss, /margin:\s*0\.75rem 0/);
  assert.match(pageCss, /height:\s*2\.125rem/);

  assert.match(layout, /columnMaxWidth: 420/);
  assert.match(layout, /heroRadius: 32/);
  assert.match(layout, /shareRowMarginTop: 16/);
  assert.match(layout, /notificationsBtnHeight: 34/);
  assert.match(layout, /sectionToggleRadius: 20/);
  assert.match(layout, /infoMarginTop: 12/);
  assert.match(layout, /infoSectionsGap: 16/);
  assert.match(layout, /infoSectionRadius: 24/);
  assert.match(layout, /MY_PROFILE_SIDEBAR_LAYOUT/);
  assert.match(layout, /headPaddingBottom: 11/);

  assert.match(styles, /sidebarHead:/);
  assert.match(styles, /headingSidebar:/);
  assert.match(styles, /borderRadius: S\.radius/);
  assert.match(styles, /mainColumnContent:/);
  assert.match(styles, /PROFILE_BANNER_MARGIN_BOTTOM = 0/);
  assert.match(styles, /marginTop: O\.infoMarginTop/);
  assert.match(styles, /marginBottom: O\.infoMarginTop/);
  assert.doesNotMatch(styles, /borderBottomLeftRadius:\s*32/);
  assert.doesNotMatch(styles, /guestContent:/);

  assert.match(profile, /styles\.guestColumn/);
  assert.match(profile, /ProfileAccountShell/);
  assert.match(profile, /overviewFooter/);
  assert.doesNotMatch(profile, /profileContentStyle/);
  assert.doesNotMatch(profile, /guestContent/);

  assert.match(overview, /styles\.infoPanel/);
});
