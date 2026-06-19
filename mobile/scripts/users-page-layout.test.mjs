import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("UsersPage mirrors web: debounced search + split body", () => {
  const source = readMobileFile("features/users-page/ui/UsersPage.tsx");

  assert.match(source, /useDebouncedValue/);
  assert.match(source, /UsersPageSearchBar/);
  assert.match(source, /UsersPageBody/);
  assert.doesNotMatch(source, /TextInput/);
});

test("UsersPageBody renders user grid with UserListRow cards", () => {
  const source = readMobileFile("features/users-page/ui/UsersPageBody.tsx");

  assert.match(source, /useUsersGridLayout/);
  assert.match(source, /numColumns=\{grid\.columns\}/);
  assert.match(source, /UserListRow/);
  assert.match(source, /onRowClick/);
});

test("UserListRow uses card layout like web", () => {
  const source = readMobileFile("entities/user/ui/UserListRow.tsx");

  assert.match(source, /UserPremiumAvatar/);
  assert.match(source, /UserPremiumDisplayName/);
  assert.match(source, /UserListRowMetric/);
  assert.match(source, /onRowClick/);
});

test("UsersSearchInput exposes pending spinner and clear a11y", () => {
  const copy = readMobileFile("shared/config/appUiCopy.ts");

  assert.match(copy, /ARIA_LABEL/);
  assert.match(copy, /CLEAR_ARIA/);
  assert.match(copy, /PENDING_ARIA/);
});

test("users grid gap matches web breakpoints", () => {
  const constants = readMobileFile("features/users-page/lib/usersGridConstants.ts");
  const resolver = readMobileFile("features/users-page/lib/resolveUsersGridGap.ts");
  const body = readMobileFile("features/users-page/ui/UsersPageBody.tsx");

  assert.match(constants, /USERS_GRID_GAP_NARROW = 8/);
  assert.match(constants, /USERS_GRID_GAP_COMPACT = 10\.4/);
  assert.match(constants, /USERS_GRID_GAP_DEFAULT = 16/);
  assert.match(resolver, /resolveUsersGridGap/);
  assert.match(body, /contentContainerStyle=\{\[styles\.list, \{ gap: grid\.gap \}\]\}/);
  assert.match(body, /columnWrapperStyle=\{grid\.columns > 1 \? \{ gap: grid\.gap \} : undefined\}/);
});

test("users route stays inside tabs for bottom nav", () => {
  const tabsLayout = readMobileFile("app/(tabs)/_layout.tsx");
  const rootLayout = readMobileFile("app/_layout.tsx");
  const tabBar = readMobileFile("shared/ui/MobileBottomTabBar.tsx");

  assert.match(tabsLayout, /name="users"/);
  assert.match(tabsLayout, /href: null/);
  assert.match(tabsLayout, /USERS_PAGE_UI\.TITLE/);
  assert.doesNotMatch(rootLayout, /name="users/);
  assert.ok(readMobileFile("app/(tabs)/users.tsx").includes("UsersPage"));
  assert.match(tabBar, /isHomeTabBarRoute/);
  assert.match(tabBar, /isHomeTabBarContext/);
});

test("users grid keeps two columns on phone", () => {
  const source = readMobileFile("features/users-page/model/useUsersGridLayout.ts");

  assert.match(source, /USERS_GRID_COLUMNS_PHONE/);
  assert.match(source, /USERS_GRID_TILE_MIN_WIDTH/);
});
