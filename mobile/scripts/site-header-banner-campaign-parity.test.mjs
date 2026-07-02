import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPO_ROOT = join(MOBILE_ROOT, "..");

const readRepoFile = (relativePath) =>
  readFileSync(join(REPO_ROOT, relativePath), "utf8");
const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("site-header-banner-campaign advertising parity", () => {
  const webPage = readRepoFile("client/src/pages/advertising/ui/AdvertisingPage.jsx");
  const mobilePage = readMobileFile("features/advertising-page/ui/AdvertisingPage.tsx");

  assert.match(webPage, /SiteHeaderBannerAdvertisingSection/);
  assert.match(mobilePage, /SiteHeaderBannerAdvertisingSection/);
  assert.match(webPage, /SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI|SiteHeaderBannerAdvertisingSection/);
  assert.match(
    readMobileFile("features/advertising-page/ui/SiteHeaderBannerAdvertisingSection.tsx"),
    /SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI/,
  );
});

test("site-header-banner-campaign moderation in intro-ad-moderation", () => {
  const webPage = readRepoFile("client/src/pages/intro-ad-moderation/ui/IntroAdModerationPage.jsx");
  const mobilePage = readMobileFile("features/intro-ad-moderation-page/ui/IntroAdModerationPage.tsx");

  assert.match(webPage, /SiteHeaderBannerCampaignModerationSection/);
  assert.match(mobilePage, /SiteHeaderBannerCampaignModerationSection/);
});

test("site-header-banner-campaign API routes wired", () => {
  const createApp = readRepoFile("server/createApp.js");
  const viteConfig = readRepoFile("client/vite.config.js");

  assert.match(createApp, /site-header-banner-campaign/);
  assert.match(viteConfig, /\/site-header-banner-campaign/);
});

test("paid slides merged in public banner API", () => {
  const controller = readRepoFile("server/controllers/SiteHeaderBanner/siteHeaderBannerControllers.js");
  const payload = readRepoFile("server/services/site-header-banner/resolveSiteHeaderBannerPayload.js");

  assert.match(controller, /resolveMergedPublicSiteHeaderBannerSlides/);
  assert.match(payload, /resolveActivePaidSiteHeaderBannerCampaignSlides/);
});

test("site-header-banner-campaign moderation preview", () => {
  const mobileCard = readMobileFile(
    "entities/site-header-banner-campaign/ui/SiteHeaderBannerCampaignModerationCard.tsx",
  );
  const webSection = readRepoFile(
    "client/src/pages/intro-ad-moderation/ui/SiteHeaderBannerCampaignModerationSection.jsx",
  );

  assert.match(mobileCard, /campaignToSiteHeaderBannerPreviewSlides/);
  assert.match(mobileCard, /SiteHeaderBannerCarousel/);
  assert.match(mobileCard, /SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI\.PREVIEW/);
  assert.match(webSection, /campaignToSiteHeaderBannerPreviewSlides/);
  assert.match(webSection, /SiteHeaderBannerCarousel/);
});
test("vite proxy routes site-header-banner-campaign before site-header-banner", () => {
  const viteConfig = readRepoFile("client/vite.config.js");

  const campaignIndex = viteConfig.indexOf('"/site-header-banner-campaign"');
  const bannerIndex = viteConfig.indexOf('"/site-header-banner"');
  assert.ok(campaignIndex >= 0 && bannerIndex >= 0);
  assert.ok(
    campaignIndex < bannerIndex,
    "site-header-banner-campaign must be listed before site-header-banner in DEV_API_PROXY_PREFIXES",
  );
  assert.match(viteConfig, /prefix === "\/site-header-banner"/);
  assert.match(viteConfig, /site-header-banner\(\?:\\\/\|\$\)/);
});
test("external banner links supported", () => {
  const webCarousel = readRepoFile("client/src/entities/site-header-banner/ui/SiteHeaderBannerCarousel.jsx");
  const mobileCarousel = readMobileFile("entities/site-header-banner/ui/SiteHeaderBannerCarousel.tsx");

  assert.match(webCarousel, /openSiteHeaderBannerLink/);
  assert.match(mobileCarousel, /Linking\.openURL/);
});
