/**
 * [TEMP A/B] Режим ленты: блоки (новая) или прежнее окно с абсолютным сдвигом.
 *
 * `?feed=legacy` / `?feed=blocks` в адресе переключает режим и запоминает
 * выбор в этом браузере — чтобы сравнить обе ленты на одном телефоне. Убрать
 * вместе с useCatalogGridVirtualizer, когда блоки подтвердятся на устройствах.
 */
export const CATALOG_FEED_MODE_BLOCKS = "blocks";
export const CATALOG_FEED_MODE_LEGACY = "legacy";

const CATALOG_FEED_MODE_STORAGE_KEY = "catalog-feed-mode";

/** @returns {"blocks" | "legacy"} */
export function resolveCatalogFeedMode() {
  if (typeof window === "undefined") {
    return CATALOG_FEED_MODE_BLOCKS;
  }
  try {
    const requested = new URLSearchParams(window.location.search).get("feed");
    if (
      requested === CATALOG_FEED_MODE_BLOCKS ||
      requested === CATALOG_FEED_MODE_LEGACY
    ) {
      window.localStorage.setItem(CATALOG_FEED_MODE_STORAGE_KEY, requested);
      return requested;
    }
    return window.localStorage.getItem(CATALOG_FEED_MODE_STORAGE_KEY) ===
      CATALOG_FEED_MODE_LEGACY
      ? CATALOG_FEED_MODE_LEGACY
      : CATALOG_FEED_MODE_BLOCKS;
  } catch {
    // Хранилище запрещено (приватный режим) — просто новая лента.
    return CATALOG_FEED_MODE_BLOCKS;
  }
}
