import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("HomeCatalogIntroVideoBackdrop: intro playlist, muted toggle, poster fallback", () => {
  const backdrop = readMobileFile("features/home-feed/ui/HomeCatalogIntroVideoBackdrop.tsx");
  const playlist = readMobileFile(
    "entities/app-intro-settings/model/useIntroBackdropPlaylist.ts",
  );
  const styles = readMobileFile("shared/theme/homeCatalogBackdropStyles.ts");
  const reExport = readMobileFile("features/home-feed/ui/HomeCatalogPrimaryBackdrop.tsx");

  assert.match(playlist, /playlist/);

  assert.match(backdrop, /useIntroBackdropPlaylist/);
  assert.match(backdrop, /LoopingCoverVideo/);
  assert.match(backdrop, /playbackActive/);
  assert.match(backdrop, /isPlaying=\{playbackActive\}/);
  assert.match(backdrop, /useState\(true\)/);
  assert.match(backdrop, /volume-off/);
  assert.match(backdrop, /volume-up/);
  assert.match(backdrop, /APP_INTRO_UI\.ENABLE_SOUND/);
  assert.match(backdrop, /accessibilityLabel/);
  assert.match(backdrop, /styles\.soundToggleButton/);
  assert.match(backdrop, /onPlaybackFailed/);
  assert.match(backdrop, /contentFit="cover"/);
  assert.match(backdrop, /cachePolicy="memory-disk"/);
  assert.match(backdrop, /resolveHomeCatalogIntroBackdropHeight/);
  assert.match(backdrop, /marginBottom: -HOME_CATALOG_FOREGROUND_SHEET_CAP_HEIGHT/);
  assert.doesNotMatch(backdrop, /paidIntro/);
  assert.doesNotMatch(backdrop, /AD_BADGE/);

  assert.match(styles, /soundToggleButton/);
  assert.match(reExport, /HomeCatalogIntroVideoBackdrop as HomeCatalogPrimaryBackdrop/);
});

test("HomeCatalogFeedSheetCap: transparent underlay for video corners", () => {
  const cap = readMobileFile("features/home-feed/ui/HomeCatalogFeedSheetCap.tsx");

  assert.match(cap, /backgroundColor: "transparent"/);
  assert.match(cap, /IS_HOME_FEED_INTRO_BACKDROP_ENABLED/);
  assert.match(cap, /styles\.homeFeedForeground/);
  assert.doesNotMatch(cap, /HOME_CATALOG_PRIMARY_BACKDROP_COLOR/);
});

test("LoopingCoverVideo shared by splash and product preview", () => {
  const splash = readMobileFile("features/app-intro/ui/AppIntroSplash.tsx");
  const preview = readMobileFile("shared/ui/ProductPreviewVideo.tsx");
  const looping = readMobileFile("shared/ui/LoopingCoverVideo.tsx");

  assert.match(splash, /LoopingCoverVideo/);
  assert.match(splash, /loop=\{false\}/);
  assert.match(preview, /LoopingCoverVideo/);
  assert.match(looping, /instance\.loop = loop/);
  assert.match(looping, /isPlaying/);
  assert.match(looping, /contentFit="cover"/);
  assert.match(looping, /Platform\.OS === "android"/);
});

test("home feed tab bar reveals on scroll past intro hero", () => {
  const index = readMobileFile("app/(tabs)/index.tsx");
  const scrollHandler = readMobileFile("features/catalog-grid/lib/useCatalogScrollHandler.ts");
  const visibility = readMobileFile("shared/model/homeCatalogTabBarVisibility.ts");
  const tabBar = readMobileFile("shared/ui/MobileBottomTabBar.tsx");

  assert.match(index, /setHomeCatalogTabBarScrollLinked/);
  assert.match(index, /syncHomeCatalogTabBarRevealDistance/);
  assert.match(scrollHandler, /homeCatalogTabBarRevealDistance/);
  assert.match(visibility, /scrollY \/ revealDistance/);
  assert.match(scrollHandler, /homeCatalogTabBarRevealProgress/);
  assert.match(visibility, /resolveHomeCatalogTabBarRevealProgress/);
  assert.match(tabBar, /homeCatalogTabBarRevealProgress/);
  assert.match(tabBar, /translateY/);
});

test("home feed index enables bounce for pull-to-refresh", () => {
  const index = readMobileFile("app/(tabs)/index.tsx");
  const scrollProps = readMobileFile("features/home-feed/lib/homeCatalogFeedListScrollProps.ts");
  const invalidate = readMobileFile("features/home-feed/model/invalidateHomeFeedQueries.ts");

  assert.match(index, /homeCatalogFeedListScrollProps/);
  assert.match(index, /ThemedRefreshControl/);
  assert.match(index, /isPullRefreshing/);
  assert.match(scrollProps, /bounces: true/);
  assert.match(scrollProps, /alwaysBounceVertical: true/);
  assert.match(invalidate, /siteHeaderBannerQueryKeys\.slides/);
});

test("home feed index still mounts HomeCatalogPrimaryBackdrop", () => {
  const index = readMobileFile("app/(tabs)/index.tsx");

  assert.match(index, /HomeCatalogPrimaryBackdrop/);
  assert.doesNotMatch(index, /HomeCatalogIntroVideoBackdrop/);
});
