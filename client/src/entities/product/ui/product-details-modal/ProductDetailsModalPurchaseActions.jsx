import { AddToCartButton } from "../../../../features/cart-add/ui/AddToCartButton.jsx";
import {
  INSTALLMENT_UI,
  PRODUCT_PRICE_OFFER_UI,
} from "../../../../shared/config/appUiCopy.js";

/**
 * @param {{
 *   productId: string;
 *   isAuthorized: boolean;
 *   onRequestLogin: () => void;
 *   purchaseLimit?: number;
 *   canShowAddToCart: boolean;
 *   auctionUi: { auctionActive: boolean };
 *   installmentUi: { installmentActive: boolean };
 *   onAuctionClick: () => void;
 *   onInstallmentClick: () => void;
 *   className?: string;
 * }} props
 */
export function ProductDetailsModalPurchaseActions({
  productId,
  isAuthorized,
  onRequestLogin,
  purchaseLimit,
  canShowAddToCart,
  auctionUi,
  installmentUi,
  onAuctionClick,
  onInstallmentClick,
  className = "",
}) {
  const rootClassName = [
    "product-details-modal__price-actions",
    canShowAddToCart
      ? ""
      : "product-details-modal__price-actions--no-cart",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClassName}>
      {canShowAddToCart ? (
        <div className="product-details-modal__price-actions-cart">
          <AddToCartButton
            productId={productId}
            isAuthorized={isAuthorized}
            onRequestLogin={onRequestLogin}
            maxQuantity={purchaseLimit}
          />
        </div>
      ) : null}
      <button
        type="button"
        className={
          auctionUi.auctionActive
            ? "product-details-modal__auction-btn"
            : "product-details-modal__auction-btn product-details-modal__auction-btn--inactive"
        }
        disabled={!auctionUi.auctionActive}
        aria-disabled={!auctionUi.auctionActive}
        onClick={onAuctionClick}
      >
        {PRODUCT_PRICE_OFFER_UI.AUCTION_SHORTCUT}
      </button>
      <button
        type="button"
        className={
          installmentUi.installmentActive
            ? "product-details-modal__auction-btn"
            : "product-details-modal__auction-btn product-details-modal__auction-btn--inactive"
        }
        disabled={!installmentUi.installmentActive}
        aria-disabled={!installmentUi.installmentActive}
        onClick={onInstallmentClick}
      >
        {INSTALLMENT_UI.SHORTCUT}
      </button>
    </div>
  );
}
