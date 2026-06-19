export const PRODUCT_PROMOTION_TIER_BANNER = 3;

/** Интервал между full-width баннерами в рядах обычных карточек. */
export const CATALOG_TIER3_BANNER_ROW_INTERVAL = 3;

export type CatalogTier3Product = {
  _id?: string;
  catalogPromotionTier?: number | null;
  catalogPromotionExpiresAt?: string | null;
  catalogPromotionActivatedAt?: string | null;
};

export const isCatalogPromotionActive = (
  product: CatalogTier3Product | null | undefined,
): boolean => {
  const raw = product?.catalogPromotionExpiresAt;
  if (!raw) {
    return false;
  }
  return new Date(raw).getTime() > Date.now();
};

export const isProductTier3BannerPromotion = (
  product: CatalogTier3Product | null | undefined,
): boolean =>
  Number(product?.catalogPromotionTier) === PRODUCT_PROMOTION_TIER_BANNER &&
  isCatalogPromotionActive(product);

export const shouldShowProductTier3BannerFullWidth = (
  product: CatalogTier3Product | null | undefined,
  { isMineMode = false, showFullWidthTier3Banners = false } = {},
): boolean => {
  if (!isProductTier3BannerPromotion(product)) {
    return false;
  }
  if (isMineMode) {
    return true;
  }
  return showFullWidthTier3Banners;
};

const compareTier3BannerActivationOrder = (a: CatalogTier3Product, b: CatalogTier3Product) => {
  const aTime = Date.parse(String(a.catalogPromotionActivatedAt ?? "")) || 0;
  const bTime = Date.parse(String(b.catalogPromotionActivatedAt ?? "")) || 0;
  if (bTime !== aTime) {
    return bTime - aTime;
  }
  return String(a._id ?? "").localeCompare(String(b._id ?? ""));
};

export const interleaveCatalogTier3Banners = <T extends CatalogTier3Product>(
  products: T[],
  columnCount: number,
  { enabled = false } = {},
): T[] => {
  if (!enabled || products.length === 0) {
    return products;
  }

  const safeColumnCount = Math.max(1, Math.floor(Number(columnCount)) || 1);
  const cardsPerBannerSlot = safeColumnCount * CATALOG_TIER3_BANNER_ROW_INTERVAL;

  const banners: T[] = [];
  const regular: T[] = [];

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

  const interleaved: T[] = [];
  let bannerIndex = 0;
  let cardsSinceLastBanner = 0;

  for (const product of regular) {
    interleaved.push(product);
    cardsSinceLastBanner += 1;

    if (cardsSinceLastBanner >= cardsPerBannerSlot && bannerIndex < banners.length) {
      interleaved.push(banners[bannerIndex]!);
      bannerIndex += 1;
      cardsSinceLastBanner = 0;
    }
  }

  return interleaved;
};
