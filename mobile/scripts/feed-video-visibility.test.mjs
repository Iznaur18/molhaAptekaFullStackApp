import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) => readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("product image shows blurhash placeholder to prevent layout shift", () => {
  const image = readMobileFile("shared/ui/CachedProductImage.tsx");
  const placeholder = readMobileFile("shared/ui/productImagePlaceholder.ts");

  assert.match(image, /placeholder=\{\{\s*blurhash/);
  assert.match(image, /placeholderContentFit/);
  assert.match(image, /recyclingKey=\{uri\}/);
  assert.match(placeholder, /PRODUCT_IMAGE_BLURHASH/);
});

test("visible-keys store gates by focus and viewable keys", () => {
  const store = readMobileFile("shared/model/visibleKeysStore.ts");

  assert.match(store, /createVisibleKeysStore/);
  assert.match(store, /setVisibleKeys/);
  assert.match(store, /setActive/);
  assert.match(store, /return active && visibleKeys\.has\(key\)/);
});

test("row visibility context defaults to visible outside the feed", () => {
  const rowVisibility = readMobileFile("shared/model/rowVisibility.tsx");

  assert.match(rowVisibility, /createContext<boolean>\(true\)/);
  assert.match(rowVisibility, /useRowVisibility/);
  assert.match(rowVisibility, /RowVisibilityBoundary/);
  assert.match(rowVisibility, /useVisibleRowsController/);
  assert.match(rowVisibility, /useSyncExternalStore/);
});

test("feed video pauses off-screen via row visibility", () => {
  const previewVideo = readMobileFile("shared/ui/ProductPreviewVideo.tsx");

  assert.match(previewVideo, /useRowVisibility/);
  assert.match(previewVideo, /isPlaying=\{isVisible\}/);
});

test("catalog screen wires viewability + focus + app state into row visibility", () => {
  const index = readMobileFile("app/(tabs)/index.tsx");

  assert.match(index, /useIsFocused/);
  assert.match(index, /useVisibleRowsController\(isFocused && appActive\)/);
  assert.match(index, /VisibleRowsProvider/);
  assert.match(index, /RowVisibilityBoundary rowKey=\{item\.key\}/);
  assert.match(index, /onViewableItemsChanged=\{rowVisibility\.onViewableItemsChanged\}/);
});

test("app lifecycle gates heavy media and trims image memory in background", () => {
  const appActive = readMobileFile("shared/model/useAppActive.ts");
  const index = readMobileFile("app/(tabs)/index.tsx");

  assert.match(appActive, /AppState\.addEventListener/);
  assert.match(appActive, /state === "active"/);
  assert.match(appActive, /state === "background"/);
  assert.match(appActive, /Image\.clearMemoryCache\(\)/);
  assert.match(index, /useTrimImageMemoryOnBackground\(\)/);
  assert.match(
    index,
    /playbackActive=\{\s*introTransition\.backdropPlaybackActive && isFocused && appActive\s*\}/,
  );
});

test("skeletons animate with a shimmer instead of staying static", () => {
  const shimmer = readMobileFile("shared/ui/SkeletonShimmer.tsx");
  const catalogSkeleton = readMobileFile("features/catalog-grid/ui/CatalogGridSkeleton.tsx");
  const bannerSlot = readMobileFile("features/home-feed/ui/SiteHeaderBannerSlot.tsx");

  assert.match(shimmer, /withRepeat/);
  assert.match(shimmer, /useAnimatedStyle/);
  assert.match(catalogSkeleton, /SkeletonShimmer/);
  assert.match(bannerSlot, /SkeletonShimmer/);
});
