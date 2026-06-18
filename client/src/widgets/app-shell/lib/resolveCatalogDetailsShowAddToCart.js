import { isCurrentUserProductSeller } from "../../../entities/product/lib/isCurrentUserProductSeller.js";
import { isSellerProductsPath } from "../../../shared/lib/sellerPaths.js";

/**
 * Показывать «В корзину» в модалке товара (buyer-path).
 * Seller-products — без корзины; raffle products — можно покупать как в каталоге.
 *
 * @param {{
 *   product: import('../../../entities/product/model/types.js').ProductFromApi | null;
 *   pathname: string;
 *   isMineMode: boolean;
 *   currentUserId?: string | null;
 * }} params
 */
export function resolveCatalogDetailsShowAddToCart({
  product,
  pathname,
  isMineMode,
  currentUserId = null,
}) {
  if (!product) {
    return false;
  }
  if (isSellerProductsPath(pathname)) {
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
