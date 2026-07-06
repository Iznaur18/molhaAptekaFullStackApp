type DiscountProduct = {
  productOldPrice?: number | null;
  productPrice?: number | null;
  discountPercent?: number | null;
  [key: string]: unknown;
};

export const computeProductDiscountPercent = (
  oldPrice: number | null | undefined,
  price: number | null | undefined,
): number | null => {
  const old = Math.floor(Number(oldPrice));
  const current = Math.floor(Number(price));
  if (!Number.isFinite(old) || !Number.isFinite(current) || old <= current) {
    return null;
  }
  return Math.floor((1 - current / old) * 100);
};

export const resolveProductDiscountPercent = (product: DiscountProduct): number | null => {
  if (product.discountPercent != null && Number.isFinite(product.discountPercent)) {
    const fromApi = Math.floor(Number(product.discountPercent));
    return fromApi > 0 ? fromApi : null;
  }
  return computeProductDiscountPercent(product.productOldPrice, product.productPrice);
};

export const hasProductCatalogDiscount = (product: DiscountProduct): boolean =>
  resolveProductDiscountPercent(product) != null;
