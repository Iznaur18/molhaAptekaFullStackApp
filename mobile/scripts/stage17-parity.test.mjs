import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SYNC = join(ROOT, "../SYNC_PLAN.md");

const readMobile = (p) => readFileSync(join(ROOT, p), "utf8");
const readSync = () => readFileSync(SYNC, "utf8");

test("17.1 stages 0–16 have no open [ ] buyer blockers in SYNC_PLAN", () => {
  const sync = readSync();
  const before17 = sync.split("# Этап 17")[0] ?? sync;
  const open = [...before17.matchAll(/^- \[ \] (.+)$/gm)].map((m) => m[1]);
  assert.deepEqual(
    open,
    [],
    `open blockers before stage 17: ${open.join(" | ") || "(none)"}`,
  );
});

test("17.2 themes light/dark/custom wired", () => {
  const theme = readMobile("shared/theme/AppThemeProvider.tsx");
  assert.match(theme, /preference === "light"/);
  assert.match(theme, /preference === "dark"/);
  assert.match(theme, /return "custom"/);
  assert.match(theme, /resolveIzTheme/);
});

test("17.3 env matrix: LAN API example + buyer path doc", () => {
  const envExample = readMobile(".env.example");
  const buyerDoc = readMobile("docs/BUYER-CRITICAL-PATH.md");

  assert.match(envExample, /EXPO_PUBLIC_API_URL=http:\/\/192\.168\./);
  assert.doesNotMatch(
    envExample.split("\n")[1] ?? "",
    /localhost/,
    "first API example must be LAN, not localhost",
  );
  assert.match(buyerDoc, /Каталог/);
  assert.match(buyerDoc, /Корзина/);
  assert.match(buyerDoc, /Заказ/);
  assert.match(buyerDoc, /Профиль/);
  assert.match(buyerDoc, /PressableScale/);
  assert.match(buyerDoc, /ThemedRefreshControl/);
});

test("17.4 money/auth: loyalty payment idempotency + balance invalidate", () => {
  const api = readMobile("entities/payment/api/paymentApi.ts");
  const watch = readMobile("entities/payment/model/useMyPaymentQuery.ts");
  const page = readMobile("features/loyalty-points-page/ui/LoyaltyPointsPage.tsx");

  assert.match(api, /idempotencyKey/);
  assert.match(api, /\/payments\/loyalty-points/);
  assert.match(watch, /invalidateQueries\(\{\s*queryKey:\s*loyaltyPointsQueryKeys/);
  assert.match(watch, /invalidateQueries\(\{\s*queryKey:\s*authMeQueryKeys/);
  assert.match(page, /useCreateLoyaltyPointsPaymentMutation/);
  assert.match(page, /loyaltyPointsBalance/);
});

test("17.5 ThemedRefreshControl + PressableScale remain on buyer CTA path", () => {
  const refresh = readMobile("shared/ui/ThemedRefreshControl.tsx");
  const press = readMobile("shared/ui/PressableScale.tsx");
  const add = readMobile("features/cart-add/ui/AddToCartButton.tsx");

  assert.match(refresh, /theme\.colors\.action/);
  assert.match(press, /transitionPressMs|pressSpringDamping|pressedScale/);
  assert.match(add, /PressableScale/);
});
