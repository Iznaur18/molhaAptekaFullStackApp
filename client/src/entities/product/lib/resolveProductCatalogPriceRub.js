/**
 * Цена за 1 шт. для каталога (как в `ProductPriceDisplay`).
 *
 * @param {import('../model/types.js').ProductFromApi | null | undefined} product
 */
export function resolveProductCatalogPriceRub(product) {
  const price = Math.floor(Number(product?.productPrice));
  if (!Number.isFinite(price) || price < 0) {
    return null;
  }
  return price;
}
