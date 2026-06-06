import { isProductTier3BannerPromotion } from "../../../entities/product/lib/isProductTier3BannerPromotion.js";

/** Интервал между full-width баннерами в рядах обычных карточек. */
export const CATALOG_TIER3_BANNER_ROW_INTERVAL = 3;

/**
 * @param {import('../../../entities/product/model/types.js').ProductFromApi} a
 * @param {import('../../../entities/product/model/types.js').ProductFromApi} b
 */
function compareTier3BannerActivationOrder(a, b) {
  const aTime = Date.parse(String(a.catalogPromotionActivatedAt ?? "")) || 0;
  const bTime = Date.parse(String(b.catalogPromotionActivatedAt ?? "")) || 0;
  if (bTime !== aTime) {
    return bTime - aTime;
  }
  return String(a._id ?? "").localeCompare(String(b._id ?? ""));
}

/**
 * Разносит L3-баннеры: после каждых {@link CATALOG_TIER3_BANNER_ROW_INTERVAL} рядов карточек.
 *
 * @param {import('../../../entities/product/model/types.js').ProductFromApi[]} products
 * @param {number} columnCount
 * @param {{ enabled?: boolean }} [options]
 */
export function interleaveCatalogTier3Banners(
  products,
  columnCount,
  { enabled = false } = {},
) {
  if (!enabled || products.length === 0) {
    return products;
  }

  const safeColumnCount = Math.max(1, Math.floor(Number(columnCount)) || 1);
  const cardsPerBannerSlot =
    safeColumnCount * CATALOG_TIER3_BANNER_ROW_INTERVAL;

  /** @type {import('../../../entities/product/model/types.js').ProductFromApi[]} */
  const banners = [];
  /** @type {import('../../../entities/product/model/types.js').ProductFromApi[]} */
  const regular = [];

  for (const product of products) {
    if (isProductTier3BannerPromotion(product)) {
      banners.push(product);
    } else {
      regular.push(product);
    }
  }

  if (banners.length === 0) {
    return products;
  }

  banners.sort(compareTier3BannerActivationOrder);

  if (regular.length === 0) {
    return banners;
  }

  /** @type {import('../../../entities/product/model/types.js').ProductFromApi[]} */
  const interleaved = [];
  let bannerIndex = 0;
  let cardsSinceLastBanner = 0;

  for (const product of regular) {
    interleaved.push(product);
    cardsSinceLastBanner += 1;

    if (cardsSinceLastBanner >= cardsPerBannerSlot && bannerIndex < banners.length) {
      interleaved.push(banners[bannerIndex]);
      bannerIndex += 1;
      cardsSinceLastBanner = 0;
    }
  }

  return interleaved;
}
