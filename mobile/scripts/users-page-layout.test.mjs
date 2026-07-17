import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("UsersPage mirrors web: search on submit + split body", () => {
  const source = readMobileFile("features/users-page/ui/UsersPage.tsx");
  const input = readMobileFile("shared/ui/UsersSearchInput.tsx");

  assert.match(source, /useScreenLayout/);
  assert.match(source, /contentPaddingTop/);
  assert.match(source, /UsersPageSearchBar/);
  assert.match(source, /UsersPageBody/);
  assert.doesNotMatch(source, /TextInput/);

  // Запрос уходит только по «Найти»: ни дебаунса, ни поиска по вводу.
  assert.doesNotMatch(source, /useDebouncedValue/);
  assert.match(source, /submittedSearch/);
  assert.match(source, /search: submittedSearch/);
  assert.match(input, /onSubmitEditing=\{onSubmit\}/);
  assert.match(input, /returnKeyType="search"/);
});

test("UsersPageBody renders user grid with UserListRow cards", () => {
  const source = readMobileFile("features/users-page/ui/UsersPageBody.tsx");

  assert.match(source, /useUsersGridLayout/);
  assert.match(source, /numColumns=\{grid\.columns\}/);
  assert.match(source, /UserListRow/);
  assert.match(source, /onRowClick/);
});

test("UserListRow stacks metrics full-width on narrow cards", () => {
  const row = readMobileFile("entities/user/ui/UserListRow.tsx");
  const styles = readMobileFile("shared/theme/userListRowStyles.ts");

  assert.match(row, /resolveUserListRowMetricsStacked/);
  assert.match(row, /onLayout/);
  assert.match(row, /stacked=\{metricsStacked\}/);
  assert.match(row, /metricsStacked && styles\.metricsStacked/);
  assert.match(styles, /metricCellStacked/);
  assert.match(styles, /metricsStacked/);
  assert.match(styles, /USER_LIST_ROW_METRICS_STACK_MAX_CARD_WIDTH/);
  assert.match(styles, /resolveUserListRowMetricsStacked/);
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
  assert.match(body, /contentPaddingBottom/);
  assert.match(body, /contentContainerStyle=\{\[styles\.list, \{ gap: grid\.gap, paddingBottom: contentPaddingBottom \}\]\}/);
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
