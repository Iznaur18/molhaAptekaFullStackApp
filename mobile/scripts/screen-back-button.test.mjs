import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { navigateBackOrHome } from "../shared/lib/navigateBackOrHome.ts";
import {
  resolveScreenBackContentPaddingTop,
  SCREEN_BACK_BUTTON_EDGE,
  SCREEN_BACK_BUTTON_GAP_BELOW,
  SCREEN_BACK_BUTTON_SIZE,
} from "../shared/lib/screenBackButtonLayout.ts";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("navigateBackOrHome uses history when available", () => {
  const calls = [];
  navigateBackOrHome({
    canGoBack: () => true,
    back: () => calls.push("back"),
    replace: (href) => calls.push(`replace:${href}`),
  });
  assert.deepEqual(calls, ["back"]);
});

test("navigateBackOrHome falls back to home", () => {
  const calls = [];
  navigateBackOrHome({
    canGoBack: () => false,
    back: () => calls.push("back"),
    replace: (href) => calls.push(`replace:${href}`),
  });
  assert.deepEqual(calls, ["replace:/"]);
});

test("resolveScreenBackContentPaddingTop reserves button + safe area", () => {
  assert.equal(
    resolveScreenBackContentPaddingTop(20),
    20 + SCREEN_BACK_BUTTON_EDGE + SCREEN_BACK_BUTTON_SIZE + SCREEN_BACK_BUTTON_GAP_BELOW,
  );
});

test("stack screens hide native header and wire ScreenWithBack / ScreenBackButton", () => {
  const layout = readMobileFile("app/_layout.tsx");
  const profileLayout = readMobileFile("app/profile/_layout.tsx");
  const tabsLayout = readMobileFile("app/(tabs)/_layout.tsx");
  const notifications = readMobileFile("app/notifications/index.tsx");
  const faq = readMobileFile("app/faq.tsx");
  const raffle = readMobileFile("app/(tabs)/raffle/[id].tsx");
  const seller = readMobileFile("app/seller/[userId].tsx");
  const userEdit = readMobileFile("app/user/[id]/edit.tsx");
  const profileEdit = readMobileFile("app/profile/edit.tsx");
  const legal = readMobileFile("features/legal/ui/LegalDocumentsScreen.tsx");
  const userHeader = readMobileFile("features/user-details-page/ui/UserDetailsHeader.tsx");
  const backButton = readMobileFile("shared/ui/ScreenBackButton.tsx");

  assert.match(layout, /headerShown:\s*false/);
  assert.doesNotMatch(layout, /headerShown:\s*true/);
  assert.match(profileLayout, /headerShown:\s*false/);
  assert.match(tabsLayout, /headerShown:\s*false/);
  assert.match(notifications, /ScreenWithBack/);
  assert.match(faq, /ScreenWithBack/);
  assert.doesNotMatch(raffle, /ScreenWithBack/);
  assert.match(seller, /ScreenWithBack/);
  assert.match(userEdit, /ScreenWithBack/);
  assert.match(profileEdit, /ScreenWithBack/);
  assert.match(legal, /ScreenWithBack/);
  assert.match(userHeader, /ScreenBackButton/);
  assert.match(userHeader, /variant="inline"/);
  assert.match(backButton, /navigateBackOrHome/);
  assert.match(backButton, /chevron-left/);
});
