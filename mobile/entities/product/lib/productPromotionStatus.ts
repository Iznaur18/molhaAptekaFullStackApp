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
