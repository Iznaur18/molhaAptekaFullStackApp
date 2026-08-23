import { AddToCartButton } from "../../../../features/cart-add/ui/AddToCartButton.jsx";
import { ADD_TO_CART_UI } from "../../../../shared/config/appUiCopy.js";

/**
 * Dock / desktop purchase: только корзина (аукцион/рассрочка — через тизеры).
 *
 * @param {{
 *   productId: string;
 *   isAuthorized: boolean;
 *   onRequestLogin: () => void;
 *   purchaseLimit?: number;
 *   canShowAddToCart: boolean;
 *   showOutOfStockPurchaseButton?: boolean;
 *   outOfStockPurchaseLabel?: string;
 *   unitPriceSnapshot?: number;
 *   className?: string;
 * }} props
 */
export function ProductDetailsModalPurchaseActions({
  productId,
  isAuthorized,
  onRequestLogin,
  purchaseLimit,
  canShowAddToCart,
  showOutOfStockPurchaseButton = false,
  outOfStockPurchaseLabel = ADD_TO_CART_UI.OUT_OF_STOCK,
  unitPriceSnapshot,
  className = "",
}) {
  if (!canShowAddToCart && !showOutOfStockPurchaseButton) {
    return null;
  }

  const rootClassName = ["product-details-modal__price-actions", className]
    .filter(Boolean)
    .join(" ");

  if (showOutOfStockPurchaseButton) {
    return (
      <div className={rootClassName}>
        <div className="product-details-modal__price-actions-cart">
          <button type="button" className="add-to-cart add-to-cart--out-of-stock" disabled>
            {outOfStockPurchaseLabel}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={rootClassName}>
      <div className="product-details-modal__price-actions-cart">
        <AddToCartButton
          productId={productId}
          isAuthorized={isAuthorized}
          onRequestLogin={onRequestLogin}
          maxQuantity={purchaseLimit}
          unitPriceSnapshot={unitPriceSnapshot}
          variant="detail"
        />
      </div>
    </div>
  );
}
