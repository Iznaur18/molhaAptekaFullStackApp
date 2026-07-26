import { AddToCartButton } from "../../../../features/cart-add/ui/AddToCartButton.jsx";

/**
 * Dock / desktop purchase: только корзина (аукцион/рассрочка — через тизеры).
 *
 * @param {{
 *   productId: string;
 *   isAuthorized: boolean;
 *   onRequestLogin: () => void;
 *   purchaseLimit?: number;
 *   canShowAddToCart: boolean;
 *   className?: string;
 * }} props
 */
export function ProductDetailsModalPurchaseActions({
  productId,
  isAuthorized,
  onRequestLogin,
  purchaseLimit,
  canShowAddToCart,
  className = "",
}) {
  if (!canShowAddToCart) {
    return null;
  }

  const rootClassName = ["product-details-modal__price-actions", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClassName}>
      <div className="product-details-modal__price-actions-cart">
        <AddToCartButton
          productId={productId}
          isAuthorized={isAuthorized}
          onRequestLogin={onRequestLogin}
          maxQuantity={purchaseLimit}
          variant="detail"
        />
      </div>
    </div>
  );
}
