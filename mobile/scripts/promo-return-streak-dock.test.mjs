import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT = join(MOBILE_ROOT, "../client/src");

const readMobile = (p) => readFileSync(join(MOBILE_ROOT, p), "utf8");
const readClient = (p) => readFileSync(join(CLIENT, p), "utf8");

test("promo return streak dock mirrors web API + claim wiring", () => {
  const api = readMobile("entities/promo-return-streak/api/promoReturnStreakApi.ts");
  const hooks = readMobile(
    "entities/promo-return-streak/model/usePromoReturnStreak.ts",
  );
  const dock = readMobile("features/promo-return-streak/ui/PromoReturnStreakDock.tsx");
  const tabBar = readMobile("shared/ui/MobileBottomTabBar.tsx");
  const copy = readMobile("shared/config/appUiCopy.ts");
  const layout = readMobile(
    "entities/promo-return-streak/lib/promoReturnStreakDockLayout.ts",
  );
  const webDock = readClient(
    "widgets/promo-return-streak-dock/ui/PromoReturnStreakDock.jsx",
  );
  const webCopy = readClient("shared/config/copy/promo-return-streak.js");
  const webCss = readClient(
    "widgets/promo-return-streak-dock/ui/PromoReturnStreakDock.css",
  );

  assert.match(api, /\/user\/me\/promo-return-streak/);
  assert.match(api, /\/user\/me\/promo-return-streak\/claim/);
  assert.match(hooks, /raffleQueryKeys\.createAdvertising/);
  assert.match(hooks, /setQueryData\(promoReturnStreakQueryKeys\.all/);

  assert.match(dock, /canClaim/);
  assert.match(dock, /CLAIM_ARIA/);
  assert.match(dock, /gapAboveNav/);
  assert.match(dock, /StreakDayTrack/);
  assert.match(webDock, /canClaim/);

  assert.match(tabBar, /PromoReturnStreakDock/);
  assert.match(copy, /PROMO_RETURN_STREAK_DOCK_UI/);
  assert.match(copy, /CLAIM: "Забрать"/);
  assert.match(webCopy, /CLAIM: "Забрать"/);

  assert.match(layout, /gapAboveNav: 14/);
  assert.match(layout, /inset: 12/);
  assert.match(webCss, /--prs-gap-above-nav:\s*14px/);
  assert.match(webCss, /--prs-inset:\s*12px/);
});
