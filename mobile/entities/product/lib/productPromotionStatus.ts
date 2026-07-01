type PromotionProduct = {
  catalogPromotionExpiresAt?: string | null;
};

export const isCatalogPromotionActive = (product: PromotionProduct | null | undefined): boolean => {
  const raw = product?.catalogPromotionExpiresAt;
  if (!raw) {
    return false;
  }
  return new Date(raw).getTime() > Date.now();
};

const PROMOTION_DATE_LOCALE = "ru-RU";

export const formatPromotionExpiresAt = (expiresAt: string | null | undefined): string => {
  if (!expiresAt) {
    return "";
  }
  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleString(PROMOTION_DATE_LOCALE, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};
