import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("home feed decouples search input from FlatList renderItem", () => {
  const index = readMobileFile("app/(tabs)/index.tsx");
  const context = readMobileFile("features/home-feed/model/HomeCatalogSearchContext.tsx");
  const embeddedSearch = readMobileFile("features/home-feed/ui/HomeCatalogEmbeddedSearchRow.tsx");

  assert.match(index, /HomeCatalogSearchProvider/);
  assert.match(index, /HomeCatalogEmbeddedSearchRow/);
  assert.doesNotMatch(index, /searchInput,\s*\n\s*styles\.homeFeedInsetContent/);
  assert.match(context, /createContext/);
  assert.match(embeddedSearch, /useHomeCatalogSearch/);
});

test("home feed pauses intro backdrop video when sheet covers hero", () => {
  const index = readMobileFile("app/(tabs)/index.tsx");
  const transition = readMobileFile("features/home-feed/model/useHomeFeedIntroTransition.ts");
  const backdrop = readMobileFile("features/home-feed/ui/HomeCatalogIntroVideoBackdrop.tsx");
  const looping = readMobileFile("shared/ui/LoopingCoverVideo.tsx");

  assert.match(
    index,
    /playbackActive=\{\s*introTransition\.backdropPlaybackActive && isFocused && appActive\s*\}/,
  );
  assert.match(transition, /backdropPlaybackActive/);
  assert.match(transition, /BACKDROP_PLAYBACK_THRESHOLD/);
  assert.match(backdrop, /isPlaying=\{playbackActive\}/);
  assert.match(looping, /isPlaying/);
  assert.match(looping, /player\.pause\(\)/);
});

test("raffle carousel plays only visible prize video", () => {
  const carousel = readMobileFile("entities/raffle/ui/RaffleFeaturedCarousel.tsx");
  const prizeMedia = readMobileFile("entities/raffle/ui/RafflePrizeMedia.tsx");
  const banner = readMobileFile("entities/raffle/ui/RaffleFeaturedBanner.tsx");

  assert.match(carousel, /onViewableItemsChanged/);
  assert.match(carousel, /windowSize=\{CAROUSEL_WINDOW_SIZE\}/);
  assert.match(carousel, /isVideoActive=\{isActive\}/);
  assert.match(prizeMedia, /isVideoActive/);
  assert.match(prizeMedia, /player\.pause\(\)/);
  assert.match(banner, /memo\(/);
});

test("home feed disables catalog row entering animations and clips off-screen rows", () => {
  const index = readMobileFile("app/(tabs)/index.tsx");
  const rowItem = readMobileFile("features/catalog-grid/ui/CatalogGridRowItem.tsx");
  const scrollProps = readMobileFile("features/home-feed/lib/homeCatalogFeedListScrollProps.ts");
  const flatList = readMobileFile("features/catalog-grid/ui/CatalogAnimatedFlatList.tsx");

  assert.match(index, /disableEntering/);
  assert.match(index, /trackCatalogScroll=\{false\}/);
  assert.match(index, /homeCatalogFeedListPerformanceProps/);
  assert.match(rowItem, /disableEntering/);
  assert.match(scrollProps, /removeClippedSubviews/);
  assert.match(flatList, /trackCatalogScroll/);
});

test("home feed opens sheet on first content ready for immediate scroll", () => {
  const index = readMobileFile("app/(tabs)/index.tsx");
  const transition = readMobileFile("features/home-feed/model/useHomeFeedIntroTransition.ts");

  assert.match(index, /hasAutoOpenedHomeFeedRef/);
  assert.match(index, /openFeedSheet/);
  assert.match(index, /homeFeedContentReady/);
  assert.match(transition, /openFeedSheet/);
  assert.match(transition, /applyScrollEnabledFromMode/);
});

test("user stories strip uses horizontal FlatList virtualization", () => {
  const strip = readMobileFile("features/home-feed/ui/UserStoriesStrip.tsx");

  assert.match(strip, /FlatList/);
  assert.match(strip, /windowSize=\{STORIES_WINDOW_SIZE\}/);
  assert.match(strip, /StoryRingItem/);
  assert.doesNotMatch(strip, /sortedRings\.map/);
});
