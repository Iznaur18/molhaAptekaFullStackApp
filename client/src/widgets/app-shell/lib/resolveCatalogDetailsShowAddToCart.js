import { isCurrentUserProductSeller } from "../../../entities/product/lib/isCurrentUserProductSeller.js";

/**
 * Показывать «В корзину» в модалке товара (buyer-path).
 * Каталог, `/seller/:id`, розыгрыш — покупатель может добавить чужой товар.
 *
 * @param {{
 *   product: import('../../../entities/product/model/types.js').ProductFromApi | null;
 *   isMineMode: boolean;
 *   currentUserId?: string | null;
 * }} params
 */
export function resolveCatalogDetailsShowAddToCart({
  product,
  isMineMode,
  currentUserId = null,
}) {
  if (!product) {
    return false;
  }
  if (isMineMode) {
    return false;
  }
  if (isCurrentUserProductSeller(product, currentUserId)) {
    return false;
  }
  return true;
}
