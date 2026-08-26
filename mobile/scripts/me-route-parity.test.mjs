import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const readMobile = (p) => readFileSync(join(ROOT, p), "utf8");

test("profile tab public path is /me with legacy /profile redirect", () => {
  const tabs = readMobile("app/(tabs)/_layout.tsx");
  const me = readMobile("app/(tabs)/me.tsx");
  const redirect = readMobile("app/profile/index.tsx");
  const edit = readMobile("app/profile/edit.tsx");
  const tabBar = readMobile("shared/ui/MobileBottomTabBar.tsx");
  const deepLink = readMobile("features/deep-linking/lib/resolveWebPathToMobileRoute.ts");

  assert.match(tabs, /name="me"/);
  assert.doesNotMatch(tabs, /name="profile"/);
  assert.ok(me.length > 0);
  assert.match(redirect, /Redirect/);
  assert.match(redirect, /href="\/me"/);
  assert.match(edit, /router\.replace\("\/\(tabs\)\/me"\)/);
  assert.match(tabBar, /routeName: "me"/);
  assert.match(deepLink, /"\/me": "\/\(tabs\)\/me"/);
  assert.match(deepLink, /"\/profile": "\/\(tabs\)\/me"/);
  assert.match(deepLink, /"\/profile\/edit": "\/profile\/edit"/);
});
