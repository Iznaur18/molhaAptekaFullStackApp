import { AddToCartButton } from "../../../../features/cart-add/ui/AddToCartButton.jsx";
import {
  ADD_TO_CART_UI,
  PRODUCT_DETAILS_MODAL_UI,
} from "../../../../shared/config/appUiCopy.js";
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
 *   showOwnProductPurchaseButton?: boolean;
 *   outOfStockPurchaseLabel?: string;
 *   blockedPurchaseLabel?: string;
 *   sellerClosedPurchaseLabel?: string;
 *   ownProductPurchaseLabel?: string;
 *   unitPriceSnapshot?: number;
 *   onBack?: () => void;
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
  showOwnProductPurchaseButton = false,
  outOfStockPurchaseLabel = ADD_TO_CART_UI.OUT_OF_STOCK,
  blockedPurchaseLabel = ADD_TO_CART_UI.BLOCKED,
  sellerClosedPurchaseLabel = ADD_TO_CART_UI.SELLER_CLOSED,
  ownProductPurchaseLabel = ADD_TO_CART_UI.OWN_PRODUCT,
  unitPriceSnapshot,
  onBack,
  className = "",
}) {
  if (
    !canShowAddToCart &&
    !showOutOfStockPurchaseButton &&
    !showBlockedPurchaseButton &&
    !showSellerClosedPurchaseButton &&
    !showOwnProductPurchaseButton
  ) {
    return null;
  }

  const rootClassName = [
    "product-details-modal__price-actions",
    typeof onBack === "function"
      ? "product-details-modal__price-actions--with-back"
      : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const cartNode = resolveCartNode({
    productId,
    isAuthorized,
    onRequestLogin,
    purchaseLimit,
    canShowAddToCart,
    showOutOfStockPurchaseButton,
    showBlockedPurchaseButton,
    showSellerClosedPurchaseButton,
    showOwnProductPurchaseButton,
    outOfStockPurchaseLabel,
    blockedPurchaseLabel,
    sellerClosedPurchaseLabel,
    ownProductPurchaseLabel,
    unitPriceSnapshot,
  });

  return (
    <div className={rootClassName}>
      {typeof onBack === "function" ? (
        <button
          type="button"
          className="product-details-modal__price-actions-back"
          onClick={(event) => {
            event.preventDefault();
            onBack();
          }}
        >
          {PRODUCT_DETAILS_MODAL_UI.BACK_ARIA}
        </button>
      ) : null}
      <div className="product-details-modal__price-actions-cart">{cartNode}</div>
    </div>
  );
}

/**
 * @param {{
 *   productId: string;
 *   isAuthorized: boolean;
 *   onRequestLogin: () => void;
 *   purchaseLimit?: number;
 *   canShowAddToCart: boolean;
 *   showOutOfStockPurchaseButton: boolean;
 *   showBlockedPurchaseButton: boolean;
 *   showSellerClosedPurchaseButton: boolean;
 *   showOwnProductPurchaseButton: boolean;
 *   outOfStockPurchaseLabel: string;
 *   blockedPurchaseLabel: string;
 *   sellerClosedPurchaseLabel: string;
 *   ownProductPurchaseLabel: string;
 *   unitPriceSnapshot?: number;
 * }} args
 */
function resolveCartNode({
  productId,
  isAuthorized,
  onRequestLogin,
  purchaseLimit,
  canShowAddToCart,
  showOutOfStockPurchaseButton,
  showBlockedPurchaseButton,
  showSellerClosedPurchaseButton,
  showOwnProductPurchaseButton,
  outOfStockPurchaseLabel,
  blockedPurchaseLabel,
  sellerClosedPurchaseLabel,
  ownProductPurchaseLabel,
  unitPriceSnapshot,
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
        {outOfStockPurchaseLabel}
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
      isPurchaseBlocked={showBlockedPurchaseButton}
      blockedPurchaseLabel={blockedPurchaseLabel}
    />
  );
}
