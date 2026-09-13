import { afterEach, expect, test } from "vitest";

import {
  CATALOG_FEED_MODE_BLOCKS,
  CATALOG_FEED_MODE_LEGACY,
  rememberCatalogFeedModeFromUrl,
  resolveCatalogFeedMode,
} from "./catalogFeedMode.js";

afterEach(() => {
  window.localStorage.removeItem("catalog-feed-mode");
  window.history.replaceState({}, "", "/");
});

test("по умолчанию — лента блоками", () => {
  expect(resolveCatalogFeedMode()).toBe(CATALOG_FEED_MODE_BLOCKS);
});

test("?feed=legacy запоминается на старте и переживает очистку адреса роутером", () => {
  window.history.replaceState({}, "", "/?feed=legacy");
  rememberCatalogFeedModeFromUrl();
  window.history.replaceState({}, "", "/");

  expect(resolveCatalogFeedMode()).toBe(CATALOG_FEED_MODE_LEGACY);

  window.history.replaceState({}, "", "/?feed=blocks");
  rememberCatalogFeedModeFromUrl();
  window.history.replaceState({}, "", "/");

  expect(resolveCatalogFeedMode()).toBe(CATALOG_FEED_MODE_BLOCKS);
});
