import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT = join(ROOT, "../client/src");

const readMobile = (p) => readFileSync(join(ROOT, p), "utf8");
const readClient = (p) => readFileSync(join(CLIENT, p), "utf8");

test("11.1 premium hero + submit disabled 0.65", () => {
  const styles = readMobile("shared/theme/premiumPageStyles.ts");
  const page = readMobile("features/premium-page/ui/PremiumPage.tsx");
  const hero = readMobile("shared/lib/profileListHeroChrome.ts");
  const webCss = readClient("pages/premium/ui/PremiumPage.css");

  assert.match(hero, /radiusDefault: 18/);
  assert.match(hero, /padding: 20/);
  assert.match(hero, /valueFontSize: 34/);
  assert.match(styles, /backgroundColor: theme\.colors\.warning/);
  assert.match(styles, /borderRadius: HERO\.radiusDefault/);
  assert.match(styles, /benefitsCard:[\s\S]*padding: 16[\s\S]*borderRadius: 14/);
  assert.match(webCss, /opacity:\s*0\.65/);
  assert.match(styles, /submitButtonDisabled:[\s\S]*opacity: 0\.65/);
  assert.match(page, /submitButtonDisabled/);
});

test("11.2 advertising games tab + lucky/fortune sections + me/config", () => {
  const page = readMobile("features/advertising-page/ui/AdvertisingPage.tsx");
  const lucky = readMobile(
    "features/advertising-page/ui/LuckyBoxAdvertisingSection.tsx",
  );
  const wheel = readMobile(
    "features/advertising-page/ui/FortuneWheelAdvertisingSection.tsx",
  );
  const luckyApi = readMobile("entities/seller-lucky-box/api/luckyBoxApi.ts");
  const wheelApi = readMobile(
    "entities/seller-fortune-wheel/api/fortuneWheelApi.ts",
  );
  const styles = readMobile("shared/theme/advertisingPageStyles.ts");
  const copy = readMobile("shared/config/appUiCopy.ts");
  const web = readClient("pages/advertising/ui/AdvertisingPage.jsx");

  assert.match(web, /TAB_GAMES|games/);
  assert.match(page, /ModalSectionTabs/);
  assert.match(page, /TAB_GAMES/);
  assert.match(page, /LuckyBoxAdvertisingSection/);
  assert.match(page, /FortuneWheelAdvertisingSection/);
  assert.match(lucky, /useMyLuckyBoxConfigQuery|fetchMyLuckyBoxConfig/);
  assert.match(wheel, /useMyFortuneWheelConfigQuery|fetchMyFortuneWheelConfig/);
  assert.match(luckyApi, /\/seller-lucky-box\/me\/config/);
  assert.match(wheelApi, /\/seller-fortune-wheel\/me\/config/);
  assert.match(styles, /radiusAdvertising|PROFILE_LIST_HERO/);
  assert.match(copy, /TAB_GAMES: "Игры"/);
  assert.match(copy, /LUCKY_BOX_ADVERTISING_UI/);
});

test("11.3 loyalty payment path + pending watch + invalidate", () => {
  const api = readMobile("entities/payment/api/paymentApi.ts");
  const mut = readMobile(
    "entities/payment/model/useCreateLoyaltyPointsPaymentMutation.ts",
  );
  const watch = readMobile("entities/payment/model/useMyPaymentQuery.ts");
  const storage = readMobile("entities/payment/lib/pendingPaymentStorage.ts");
  const page = readMobile("features/loyalty-points-page/ui/LoyaltyPointsPage.tsx");
  const copy = readMobile("shared/config/appUiCopy.ts");
  const web = readClient("pages/loyalty-points/ui/LoyaltyPointsPage.jsx");

  assert.match(web, /useCreateLoyaltyPointsPaymentMutation/);
  assert.match(api, /\/payments\/loyalty-points/);
  assert.match(api, /createLoyaltyPointsPayment/);
  assert.match(api, /fetchMyPayment/);
  assert.match(mut, /createLoyaltyPointsPayment/);
  assert.match(watch, /loyaltyPointsQueryKeys/);
  assert.match(watch, /authMeQueryKeys/);
  assert.match(watch, /refetchInterval/);
  assert.match(storage, /rememberPendingPaymentId|SecureStore/);
  assert.match(page, /cardPaymentEnabled/);
  assert.match(page, /Linking\.openURL|confirmationUrl/);
  assert.match(page, /COMING_SOON_AMOUNT/);
  assert.match(copy, /PAY_PENDING/);
  assert.match(copy, /PAY_SUCCESS/);
  assert.match(copy, /Пополнение по СБП — скоро/);
});

test("11.4 partner sales tab + AffiliateSalesPanel", () => {
  const page = readMobile("features/partner-program-page/ui/PartnerProgramPage.tsx");
  const panel = readMobile(
    "features/affiliate-listings-page/ui/AffiliateSalesPanel.tsx",
  );
  const api = readMobile("entities/user/api/affiliateProgram.ts");
  const copy = readMobile("shared/config/appUiCopy.ts");
  const web = readClient("pages/partner-program/ui/PartnerProgramPage.jsx");

  assert.match(web, /TAB_SALES|AffiliateSalesPanel/);
  assert.match(page, /ModalSectionTabs/);
  assert.match(page, /TAB_SALES/);
  assert.match(page, /AffiliateSalesPanel/);
  assert.match(panel, /useMyAffiliateSalesQuery/);
  assert.match(api, /fetchMyAffiliateSales|affiliate\/sales/);
  assert.match(copy, /TAB_SALES/);
});

test("11.5 subscriptions following + followers", () => {
  const page = readMobile("features/subscriptions-page/ui/SubscriptionsPage.tsx");
  const api = readMobile("entities/user-follow/api/userFollowApi.ts");
  const query = readMobile("entities/user-follow/model/useMyFollowersQuery.ts");
  const copy = readMobile("shared/config/appUiCopy.ts");
  const web = readClient("pages/subscriptions/ui/SubscriptionsPage.jsx");

  assert.match(web, /followers|useMyFollowersQuery/);
  assert.match(page, /useMyFollowersQuery/);
  assert.match(page, /useMyFollowingQuery/);
  assert.match(page, /TAB_FOLLOWERS/);
  assert.match(api, /\/user\/me\/followers/);
  assert.match(api, /fetchMyFollowers/);
  assert.match(query, /fetchMyFollowers/);
  assert.match(copy, /TAB_FOLLOWERS: "Подписчики"/);
});
