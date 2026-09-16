import { AddToCartButton } from "../../../features/cart-add/ui/AddToCartButton.jsx";
import { ADD_TO_CART_UI } from "../../../shared/config/appUiCopy.js";
import { BlockedPurchaseButton } from "../../../shared/ui/BlockedPurchaseButton.jsx";

/**
 * Кнопка покупки товара: «В корзину» или неактивная кнопка с причиной.
 * Одна и та же в окне товара и на карточке главного экрана — состояние
 * берётся из `resolveProductPurchaseButtonState`.
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
 *   showOwnProductPurchaseButton?: boolean;
 *   outOfStockPurchaseLabel?: string;
 *   blockedPurchaseLabel?: string;
 *   sellerClosedPurchaseLabel?: string;
 *   ownProductPurchaseLabel?: string;
 *   unitPriceSnapshot?: number;
 *   guestLabel?: string;
 * }} props
 */
export function ProductPurchaseCartButton({
  productId,
  isAuthorized,
  onRequestLogin,
  purchaseLimit,
  canShowAddToCart,
  showOutOfStockPurchaseButton = false,
  showBlockedPurchaseButton = false,
  showSellerClosedPurchaseButton = false,
  showOwnProductPurchaseButton = false,
  outOfStockPurchaseLabel = ADD_TO_CART_UI.OUT_OF_STOCK,
  blockedPurchaseLabel = ADD_TO_CART_UI.BLOCKED,
  sellerClosedPurchaseLabel = ADD_TO_CART_UI.SELLER_CLOSED,
  ownProductPurchaseLabel = ADD_TO_CART_UI.OWN_PRODUCT,
  unitPriceSnapshot,
  guestLabel,
}) {
  if (showOwnProductPurchaseButton) {
    return (
      <button
        type="button"
        className="add-to-cart add-to-cart--out-of-stock"
        disabled
        aria-disabled="true"
      >
        {ownProductPurchaseLabel}
      </button>
    );
  }

  if (showBlockedPurchaseButton) {
    return <BlockedPurchaseButton label={blockedPurchaseLabel} variant="cart" />;
  }

  if (showOutOfStockPurchaseButton) {
    return (
      <button type="button" className="add-to-cart add-to-cart--out-of-stock" disabled>
        {outOfStockPurchaseLabel || ADD_TO_CART_UI.OUT_OF_STOCK}
      </button>
    );
  }

  if (showSellerClosedPurchaseButton) {
    return (
      <button type="button" className="add-to-cart add-to-cart--out-of-stock" disabled>
        {sellerClosedPurchaseLabel}
      </button>
    );
  }

  if (!canShowAddToCart) {
    return null;
  }

  return (
    <AddToCartButton
      productId={productId}
      isAuthorized={isAuthorized}
      onRequestLogin={onRequestLogin}
      maxQuantity={purchaseLimit}
      unitPriceSnapshot={unitPriceSnapshot}
      variant="detail"
      guestLabel={guestLabel}
    />
  );
}
