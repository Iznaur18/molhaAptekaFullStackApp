/**
 * Ручная скидка продавца — старая цена выше текущей, выставленная вручную.
 * Горящая скидка тоже пишет `productOldPrice`, но она не «ручная»: её нельзя
 * считать блокером самой себя. Порт `client/.../hasProductManualCatalogDiscount.js`.
 */
export const hasProductManualCatalogDiscount = (
  /** Значимые поля: productFlashSaleEnabled, productOldPrice, productPrice. */
  product: Record<string, unknown> | null | undefined,
): boolean => {
  if (product?.productFlashSaleEnabled === true) {
    return false;
  }
  const oldPrice = Math.floor(Number(product?.productOldPrice));
  const price = Math.floor(Number(product?.productPrice));
  if (!Number.isFinite(oldPrice) || !Number.isFinite(price)) {
    return false;
  }
  return oldPrice > price;
};
