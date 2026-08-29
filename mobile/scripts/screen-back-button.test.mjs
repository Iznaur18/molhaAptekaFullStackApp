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

test("screen back overlay matches auth-page__back chrome", () => {
  const layout = readMobileFile("shared/lib/screenBackButtonLayout.ts");
  const styles = readMobileFile("shared/theme/screenBackButtonStyles.ts");
  const backButton = readMobileFile("shared/ui/ScreenBackButton.tsx");
  const authLayout = readMobileFile("shared/lib/authPageLayout.ts");
  const webCss = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "../../client/src/pages/auth/ui/AuthPage.css"),
    "utf8",
  );

  assert.match(layout, /SCREEN_BACK_BUTTON_SIZE = 40/);
  assert.match(layout, /SCREEN_BACK_BUTTON_TOP_INSET = 8/);
  assert.match(layout, /SCREEN_BACK_BUTTON_LEFT_INSET = 16/);
  assert.match(authLayout, /backSize: 40/);
  assert.match(authLayout, /backRadius: 10/);
  assert.match(styles, /backgroundColor: "rgba\(255, 255, 255, 0\.14\)"/);
  assert.match(styles, /borderRadius: SCREEN_BACK_BUTTON_RADIUS/);
  assert.match(backButton, /Math\.max\(insets\.left, SCREEN_BACK_BUTTON_LEFT_INSET\)/);
  assert.match(backButton, /Feather/);
  assert.match(backButton, /theme\.colors\.link/);
  assert.match(webCss, /\.auth-page__back[\s\S]*background: rgba\(255, 255, 255, 0\.14\)/);
  assert.match(webCss, /border-radius: var\(--iz-control-btn-radius, 10px\)/);
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
