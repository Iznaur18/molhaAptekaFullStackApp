import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("subscriptions page mirrors web hub chrome and list", () => {
  const page = readMobileFile("features/subscriptions-page/ui/SubscriptionsPage.tsx");
  const styles = readMobileFile("shared/theme/subscriptionsPageStyles.ts");

  assert.match(page, /ProfileMobileSectionToggle/);
  assert.match(page, /ProfileMobileNavSheet/);
  assert.match(page, /contentPaddingBottom/);
  assert.match(page, /SubscriptionUserRow/);
  assert.match(page, /activeSectionId="subscriptions"/);
  assert.match(page, /TAB_SUBSCRIPTIONS/);
  assert.doesNotMatch(page, /accountFeatureStyles/);
  assert.doesNotMatch(page, /unfollow/);
  assert.doesNotMatch(page, /useUnfollowUserMutation/);

  assert.match(styles, /loginButton/);
  assert.match(styles, /LIST_GAP/);
});

test("subscription user row mirrors web row layout", () => {
  const row = readMobileFile("features/subscriptions-page/ui/SubscriptionUserRow.tsx");

  assert.match(row, /onRowClick/);
  assert.match(row, /UserPremiumAvatar/);
  assert.match(row, /UserPremiumDisplayName/);
  assert.doesNotMatch(row, /accountFeatureStyles/);
});

test("subscriptions ui copy matches web page", () => {
  const copy = readMobileFile("shared/config/appUiCopy.ts");

  assert.match(copy, /Загрузка подписок…/);
  assert.match(copy, /Найдите продавцов в разделе «Пользователи»/);
  assert.match(copy, /Войдите, чтобы видеть список подписок./);
});
