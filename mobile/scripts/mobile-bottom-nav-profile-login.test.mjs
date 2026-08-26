import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("bottom nav profile: guest goes to /(auth)/login (web /login parity)", () => {
  const tabBar = readMobile("shared/ui/MobileBottomTabBar.tsx");
  const webNav = readFileSync(
    join(
      MOBILE_ROOT,
      "../client/src/widgets/mobile-bottom-nav/ui/MobileBottomNav.jsx",
    ),
    "utf8",
  );

  assert.match(webNav, /handleProfileClick/);
  assert.match(webNav, /onLoginClick\(\)/);
  assert.match(tabBar, /routeName === "me" && !isAuthorized/);
  assert.match(tabBar, /router\.push\("\/\(auth\)\/login"\)/);
  assert.match(
    tabBar,
    /isAuthorized && unreadNotifications > 0 \? formatBadge\(unreadNotifications\)/,
  );
});
