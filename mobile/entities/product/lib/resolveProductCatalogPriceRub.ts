export const resolveProductCatalogPriceRub = (
  product: { productPrice?: unknown } | null | undefined,
): number | null => {
  const price = Math.floor(Number(product?.productPrice));
  if (!Number.isFinite(price) || price < 0) {
    return null;
  }
  return price;
};
