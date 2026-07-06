import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPO_ROOT = join(MOBILE_ROOT, "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

const readRepoFile = (relativePath) =>
  readFileSync(join(REPO_ROOT, relativePath), "utf8");

test("site header banner admin page mirrors web form and hub chrome", () => {
  const page = readMobileFile(
    "features/site-header-banner-admin-page/ui/SiteHeaderBannerAdminPage.tsx",
  );
  const hook = readMobileFile(
    "features/site-header-banner-admin-page/model/useSiteHeaderBannerAdminPage.ts",
  );
  const webPage = readRepoFile(
    "client/src/pages/site-header-banner-admin/ui/SiteHeaderBannerAdminPage.jsx",
  );

  assert.match(page, /ProfileMobileSectionToggle/);
  assert.match(page, /ProfileMobileNavSheet/);
  assert.match(page, /contentPaddingBottom/);
  assert.match(page, /activeSectionId="site-header-banner-admin"/);
  assert.match(page, /TAB_SITE_HEADER_BANNER_ADMIN/);
  assert.match(page, /LABEL_ENABLED/);
  assert.match(page, /SiteHeaderBannerCarousel/);
  assert.match(page, /resolvePreviewSiteHeaderBannerSlidesFromForm/);
  assert.match(page, /styles\.panel/);
  assert.match(page, /styles\.slideZone/);
  assert.match(page, /styles\.controlPanel/);
  assert.doesNotMatch(page, /styles\.slideDivider/);
  assert.match(page, /ImageUrlUploadField/);
  assert.match(page, /LABEL_IMAGE_ALT/);

  assert.match(webPage, /SiteHeaderBannerCarousel/);
  assert.match(webPage, /site-header-banner-admin__toolbar/);
  assert.match(webPage, /site-header-banner-admin__panel/);
  assert.match(webPage, /site-header-banner-admin__slide-zone/);
  assert.doesNotMatch(webPage, /site-header-banner-admin__slide-divider/);
  assert.doesNotMatch(webPage, /site-header-banner-admin__slides-stack/);
  assert.match(page, /styles\.slideTitle/);
  assert.doesNotMatch(webPage, /site-header-banner-admin__legend/);
  assert.match(webPage, /type="color"/);
  assert.doesNotMatch(webPage, /site-header-banner-admin__workspace/);
  assert.doesNotMatch(webPage, /site-header-banner-admin__save-bar/);

  assert.match(hook, /validateSiteHeaderBannerAdminForm/);
  assert.match(hook, /buildPatchSiteHeaderBannerSettingsBody/);
});

test("home catalog feed renders banner in scrollable list header", () => {
  const catalogScreen = readMobileFile("app/(tabs)/index.tsx");
  const bannerRow = readMobileFile(
    "features/home-feed/ui/HomeCatalogSiteHeaderBannerRow.tsx",
  );
  const searchRow = readMobileFile("features/home-feed/ui/HomeCatalogSearchRow.tsx");
  const slot = readMobileFile("features/home-feed/ui/SiteHeaderBannerSlot.tsx");
  const carousel = readMobileFile("entities/site-header-banner/ui/SiteHeaderBannerCarousel.tsx");

  assert.match(catalogScreen, /HomeCatalogSiteHeaderBannerRow/);
  assert.match(catalogScreen, /ListHeaderComponent=\{listHeader\}/);
  assert.match(
    catalogScreen,
    /showHomeFeed \? <HomeCatalogSiteHeaderBannerRow visible=\{showHomeFeed\} \/>/,
  );
  assert.doesNotMatch(searchRow, /SiteHeaderBannerSlot/);
  assert.match(bannerRow, /SiteHeaderBannerSlot/);
  assert.match(bannerRow, /bannerListHeaderFullWidth/);
  assert.doesNotMatch(bannerRow, /edgeToEdge/);
  assert.doesNotMatch(bannerRow, /layoutWidth/);
  assert.doesNotMatch(bannerRow, /marginHorizontal: -/);
  assert.match(slot, /useSiteHeaderBannerSlidesQuery/);
  assert.match(carousel, /resolveSiteHeaderBannerCarouselMetrics/);
  assert.match(carousel, /snapToInterval/);
  assert.match(carousel, /AUTOPLAY_MS/);
  assert.match(carousel, /resolveSiteHeaderBannerMobileRoute/);
});

test("web header renders carousel after glass header panel", () => {
  const header = readRepoFile("client/src/app/ui/AppShellHeader.jsx");
  const shellCss = readRepoFile("client/src/app/ui/AppShell.css");
  const carousel = readRepoFile(
    "client/src/entities/site-header-banner/ui/SiteHeaderBannerCarousel.jsx",
  );

  assert.match(header, /app-shell__header-panel/);
  assert.match(header, /SiteHeaderBannerCarousel/);
  assert.match(header, /showSiteHeaderBannerOnViewport/);
  assert.match(header, /isMobileNav/);
  assert.match(header, /siteHeaderBannerSlides/);
  assert.match(
    header,
    /app-shell__header-panel[\s\S]*<\/div>\s*\n\s*\{siteHeaderBannerSlides\.length > 0/,
  );
  assert.match(shellCss, /\.app-shell--header-v1 \.app-shell__header-panel/);
  const headerV1Rule =
    shellCss.match(/\.app-shell--header-v1 \.app-shell__header--v1 \{[^}]+\}/)?.[0] ?? "";
  const headerPanelRule =
    shellCss.match(/\.app-shell--header-v1 \.app-shell__header-panel \{[^}]+\}/)?.[0] ?? "";
  assert.doesNotMatch(headerV1Rule, /position:\s*sticky/);
  assert.match(headerPanelRule, /position:\s*sticky/);
  assert.match(carousel, /AUTOPLAY_MS/);
});

test("profile tab registry includes site header banner admin", () => {
  const profileTabs = readRepoFile("client/src/widgets/app-shell/lib/profileTabs.js");

  assert.match(profileTabs, /PROFILE_TAB_SITE_HEADER_BANNER_ADMIN/);
  assert.match(
    profileTabs,
    /PROFILE_TAB_VALUES[\s\S]*PROFILE_TAB_SITE_HEADER_BANNER_ADMIN/,
  );
});

test("shared staff section and api routes exist", () => {
  const staffSections = readRepoFile("packages/shared-lib/src/profileSections.ts");
  const staffMainViews = readRepoFile("packages/shared-lib/src/staffMainViews.ts");
  const router = readRepoFile("server/routes/siteHeaderBannerRouter.js");
  const contract = readRepoFile("contract/src/siteHeaderBanner.js");

  assert.match(staffSections, /PROFILE_SECTION_SITE_HEADER_BANNER_ADMIN/);
  assert.match(staffMainViews, /site-header-banner-admin/);
  assert.match(router, /getSiteHeaderBannerSlidesController/);
  assert.match(router, /checkProductModeratorMW/);
  assert.match(contract, /SITE_HEADER_BANNER_HEIGHT_PX = 180/);
  assert.match(contract, /SITE_HEADER_BANNER_CAROUSEL_SLIDE_GAP_PX = 8/);
});
