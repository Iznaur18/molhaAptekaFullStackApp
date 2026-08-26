import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const readMobile = (p) => readFileSync(join(ROOT, p), "utf8");

test("profile account shell keeps sidebar on hub desktop like web /me", () => {
  const shell = readMobile("features/profile-tab/ui/ProfileAccountShell.tsx");
  const scrollContext = readMobile("features/profile-tab/model/ProfileAccountScrollContext.tsx");
  const profileAccountList = readMobile("features/profile-tab/ui/ProfileAccountList.tsx");
  const profileAccountScrollBody = readMobile(
    "features/profile-tab/ui/ProfileAccountScrollBody.tsx",
  );
  const dataConfirmation = readMobile(
    "features/data-confirmation-page/ui/DataConfirmationPage.tsx",
  );
  const myProducts = readMobile("features/my-products-page/ui/MyProductsPage.tsx");
  const hub = readMobile("app/(tabs)/hub/[section].tsx");
  const me = readMobile("app/(tabs)/me.tsx");
  const toggle = readMobile("features/profile-tab/ui/ProfileMobileSectionToggle.tsx");

  assert.match(shell, /isDrawerLayout/);
  assert.match(shell, /variant="sidebar"/);
  assert.match(shell, /mode === "overview"/);
  assert.match(shell, /mode === "hub"|mode = "hub"/);
  assert.match(shell, /ProfileAccountScrollProvider/);
  assert.match(shell, /outerScrollOwns/);
  assert.match(shell, /DesktopShellScroll/);
  assert.match(scrollContext, /outerScrollOwns/);
  assert.match(scrollContext, /useProfileAccountNestedListScroll/);
  assert.match(myProducts, /ProfileAccountList/);
  assert.match(myProducts, /useProfileAccountNestedListScroll/);
  assert.match(profileAccountList, /outerScrollOwns/);
  assert.match(profileAccountList, /resolveListStyle/);
  assert.match(profileAccountScrollBody, /outerScrollOwns/);
  assert.match(profileAccountScrollBody, /scrollEnabled=\{scrollEnabled\}/);
  assert.match(dataConfirmation, /ProfileAccountScrollBody/);
  assert.match(dataConfirmation, /contentInAccountShell/);
  assert.doesNotMatch(dataConfirmation, /<ScrollView/);

  const accountScrollPages = [
    "features/premium-page/ui/PremiumPage.tsx",
    "features/loyalty-points-page/ui/LoyaltyPointsPage.tsx",
    "features/partner-program-page/ui/PartnerProgramPage.tsx",
    "features/advertising-page/ui/AdvertisingPage.tsx",
  ];
  for (const pagePath of accountScrollPages) {
    const page = readMobile(pagePath);
    assert.match(page, /ProfileAccountScrollBody/, pagePath);
    assert.match(page, /contentInAccountShell/, pagePath);
    assert.doesNotMatch(page, /<ScrollView/, pagePath);
  }

  const adminPanelPages = [
    "features/category-tree-admin-page/ui/CategoryTreeAdminPage.tsx",
    "features/search-synonyms-admin-page/ui/SearchSynonymsAdminPage.tsx",
    "features/popular-products-admin-page/ui/PopularProductsAdminProductsTab.tsx",
    "features/admin-orders-page/ui/AdminOrdersPage.tsx",
  ];
  for (const pagePath of adminPanelPages) {
    const page = readMobile(pagePath);
    assert.match(page, /pageListInAccountShell|listInAccountShell/, pagePath);
    assert.match(page, /useProfileAdaptiveLayout/, pagePath);
  }

  const adminStyles = readMobile("shared/theme/adminPanelStyles.ts");
  assert.match(adminStyles, /pageListInAccountShell/);
  assert.match(adminStyles, /ADMIN_PANEL_PAGE_LAYOUT/);

  const moderationScrollPages = [
    "features/intro-ad-moderation-page/ui/IntroAdModerationPage.tsx",
    "features/installment-disputes-page/ui/InstallmentDisputesPage.tsx",
    "features/site-header-banner-admin-page/ui/SiteHeaderBannerAdminPage.tsx",
  ];
  for (const pagePath of moderationScrollPages) {
    const page = readMobile(pagePath);
    assert.match(page, /ProfileAccountScrollBody/, pagePath);
    assert.doesNotMatch(page, /scrollEnabled=\{scrollEnabled\}/, pagePath);
  }
  assert.doesNotMatch(myProducts, /resolveListStyle/);
  assert.doesNotMatch(myProducts, /scrollEnabled=\{scrollEnabled\}/);

  assert.match(hub, /ProfileAccountShell/);
  assert.match(hub, /mode="hub"/);
  assert.match(hub, /activeSectionId=\{sectionId/);

  assert.match(me, /ProfileAccountShell/);
  assert.match(me, /mode="overview"/);

  assert.match(toggle, /if \(!isDrawerLayout\)/);
  assert.match(toggle, /return null/);
});
