import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("HomeCatalogSearchRow: logo left, search center, users right", () => {
  const source = readMobileFile("features/home-feed/ui/HomeCatalogSearchRow.tsx");

  assert.match(source, /HomeCatalogBrandLogo/);
  assert.match(source, /HomeCatalogUsersButton/);
  assert.match(source, /styles\.searchSlot/);
  assert.doesNotMatch(source, /useAuthSessionQuery/);
});

test("home catalog brand logo asset is bundled from mobile assets", () => {
  const source = readMobileFile("features/home-feed/lib/homeCatalogBrandLogoAsset.ts");

  assert.match(source, /logo-izibuy\.png/);
});

test("HOME_PAGE_UI exposes brand accessibility copy", () => {
  const source = readMobileFile("shared/config/homePageUi.ts");

  assert.match(source, /LOGO_ALT/);
  assert.match(source, /NAV_TO_HOME/);
});
