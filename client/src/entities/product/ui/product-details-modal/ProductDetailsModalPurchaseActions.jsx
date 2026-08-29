import { AddToCartButton } from "../../../../features/cart-add/ui/AddToCartButton.jsx";
import { ADD_TO_CART_UI } from "../../../../shared/config/appUiCopy.js";
import { BlockedPurchaseButton } from "../../../../shared/ui/BlockedPurchaseButton.jsx";

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
 *   showBlockedPurchaseButton?: boolean;
 *   showSellerClosedPurchaseButton?: boolean;
 *   outOfStockPurchaseLabel?: string;
 *   blockedPurchaseLabel?: string;
 *   sellerClosedPurchaseLabel?: string;
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
  showBlockedPurchaseButton = false,
  showSellerClosedPurchaseButton = false,
  outOfStockPurchaseLabel = ADD_TO_CART_UI.OUT_OF_STOCK,
  blockedPurchaseLabel = ADD_TO_CART_UI.BLOCKED,
  sellerClosedPurchaseLabel = ADD_TO_CART_UI.SELLER_CLOSED,
  unitPriceSnapshot,
  className = "",
}) {
  if (
    !canShowAddToCart &&
    !showOutOfStockPurchaseButton &&
    !showBlockedPurchaseButton &&
    !showSellerClosedPurchaseButton
  ) {
    return null;
  }

  const rootClassName = ["product-details-modal__price-actions", className]
    .filter(Boolean)
    .join(" ");

  if (showBlockedPurchaseButton) {
    return (
      <div className={rootClassName}>
        <div className="product-details-modal__price-actions-cart">
          <BlockedPurchaseButton label={blockedPurchaseLabel} variant="cart" />
        </div>
      </div>
    );
  }

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

  if (showSellerClosedPurchaseButton) {
    return (
      <div className={rootClassName}>
        <div className="product-details-modal__price-actions-cart">
          <button type="button" className="add-to-cart add-to-cart--out-of-stock" disabled>
            {sellerClosedPurchaseLabel}
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
          isPurchaseBlocked={showBlockedPurchaseButton}
          blockedPurchaseLabel={blockedPurchaseLabel}
        />
      </div>
    </div>
  );
}
