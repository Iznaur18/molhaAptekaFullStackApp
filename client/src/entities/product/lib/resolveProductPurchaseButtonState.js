import { getProductPurchaseLimit } from "./getProductPurchaseLimit.js";
import { resolveProductOutOfStockOverlayLabel } from "./resolveProductOutOfStockOverlayLabel.js";
import { resolveProductPurchaseBlockState } from "./resolveProductPurchaseBlockState.js";
import { resolveProductSellerClosedPurchaseState } from "./resolveProductSellerClosedPurchaseState.js";

/**
 * Какую кнопку покупки показать: «В корзину» или состояние вместо неё
 * («Свой товар», «Вы заблокированы», «Нет в наличии», «У нас закрыто»).
 * Общая для окна товара и карточки на главном экране.
 *
 * @param {{
 *   product: Record<string, unknown> | null | undefined;
 *   isOwnProduct: boolean;
 *   showAddToCart?: boolean;
 * }} input
 */
export function resolveProductPurchaseButtonState({
  product,
  isOwnProduct,
  showAddToCart = true,
}) {
  const hasProduct = product?._id != null;
  const purchaseLimit = product ? getProductPurchaseLimit(product) : 0;
  const isOutOfStock = product?.productOutOfStock === true;
  const { isPurchaseBlocked, blockedLabel } = resolveProductPurchaseBlockState(product);
  const { isSellerClosed, closedLabel } =
    resolveProductSellerClosedPurchaseState(product);

  const canShowAddToCart =
    showAddToCart &&
    hasProduct &&
    !isOwnProduct &&
    purchaseLimit > 0 &&
    !isOutOfStock &&
    !isPurchaseBlocked &&
    !isSellerClosed;
  const showOutOfStockPurchaseButton =
    showAddToCart && hasProduct && !isOwnProduct && isOutOfStock;
  const showBlockedPurchaseButton = hasProduct && !isOwnProduct && isPurchaseBlocked;
  const showSellerClosedPurchaseButton =
    hasProduct &&
    !isOwnProduct &&
    isSellerClosed &&
    !isPurchaseBlocked &&
    !isOutOfStock;
  const showOwnProductPurchaseButton = hasProduct && isOwnProduct;

  return {
    purchaseLimit,
    isPurchaseBlocked,
    canShowAddToCart,
    showOutOfStockPurchaseButton,
    showBlockedPurchaseButton,
    showSellerClosedPurchaseButton,
    showOwnProductPurchaseButton,
    hasPurchaseButton:
      canShowAddToCart ||
      showOutOfStockPurchaseButton ||
      showBlockedPurchaseButton ||
      showSellerClosedPurchaseButton ||
      showOwnProductPurchaseButton,
    outOfStockPurchaseLabel: product
      ? resolveProductOutOfStockOverlayLabel(product)
      : "",
    blockedPurchaseLabel: blockedLabel,
    sellerClosedPurchaseLabel: closedLabel,
  };
}
