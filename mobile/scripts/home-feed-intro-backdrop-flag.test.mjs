import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("home feed intro backdrop is gated by an explicit boolean flag", () => {
  const flag = readMobileFile("features/home-feed/model/isHomeFeedIntroBackdropEnabled.ts");
  const index = readMobileFile("app/(tabs)/index.tsx");
  const transition = readMobileFile("features/home-feed/model/useHomeFeedIntroTransition.ts");
  const tabBar = readMobileFile("shared/ui/MobileBottomTabBar.tsx");
  const cap = readMobileFile("features/home-feed/ui/HomeCatalogFeedSheetCap.tsx");

  assert.match(flag, /export const IS_HOME_FEED_INTRO_BACKDROP_ENABLED = false/);
  assert.match(index, /IS_HOME_FEED_INTRO_BACKDROP_ENABLED/);
  assert.match(index, /introBackdropEnabled: IS_HOME_FEED_INTRO_BACKDROP_ENABLED/);
  assert.match(index, /IS_HOME_FEED_INTRO_BACKDROP_ENABLED \? \(/);
  assert.match(index, /IS_HOME_FEED_INTRO_BACKDROP_ENABLED \? <HomeCatalogPrimaryBackdrop/);
  assert.match(index, /resolveHomeFeedDockOffset/);
  assert.match(index, /setHomeCatalogTabBarProgressDriven\(IS_HOME_FEED_INTRO_BACKDROP_ENABLED \? 0 : 1\)/);
  assert.match(transition, /introBackdropEnabled/);
  assert.match(transition, /\.enabled\(introBackdropEnabled\)/);
  assert.match(transition, /if \(!introBackdropEnabled\)/);
  assert.match(tabBar, /IS_HOME_FEED_INTRO_BACKDROP_ENABLED/);
  assert.match(tabBar, /if \(!IS_HOME_FEED_INTRO_BACKDROP_ENABLED\)/);
  assert.match(cap, /IS_HOME_FEED_INTRO_BACKDROP_ENABLED/);
  assert.match(cap, /styles\.homeFeedForeground/);
});

test("disabled intro backdrop starts feed open without docking offset", () => {
  const flag = readMobileFile("features/home-feed/model/isHomeFeedIntroBackdropEnabled.ts");
  const index = readMobileFile("app/(tabs)/index.tsx");
  const transition = readMobileFile("features/home-feed/model/useHomeFeedIntroTransition.ts");
  const visibility = readMobileFile("shared/model/homeCatalogTabBarVisibility.ts");

  assert.match(flag, /= false/);
  assert.match(index, /if \(!IS_HOME_FEED_INTRO_BACKDROP_ENABLED\) \{\s*return 0;/);
  assert.match(transition, /const initialOpen = introBackdropEnabled \? 0 : 1/);
  assert.match(index, /hasAutoOpenedHomeFeedRef/);
  assert.match(
    index,
    /if \(!IS_HOME_FEED_INTRO_BACKDROP_ENABLED\) \{\s*hasAutoOpenedHomeFeedRef\.current = true;\s*openFeedSheet\(\);\s*return;/,
  );
  assert.match(visibility, /setHomeCatalogTabBarProgressDriven = \(initialReveal = 0\)/);
});
