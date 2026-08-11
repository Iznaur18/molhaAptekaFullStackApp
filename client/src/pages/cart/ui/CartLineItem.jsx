import { useState } from "react";

import { useCart } from "../../../entities/cart/model/useCart.js";
import { getCartLineStockHint } from "../../../entities/cart/lib/getCartLineStockHint.js";
import { getProductPurchaseLimit } from "../../../entities/product/lib/getProductPurchaseLimit.js";
import { resolveProductImageUrl } from "../../../entities/product/lib/resolveProductImageUrl.js";
import { PRODUCT_IMAGE_PLACEHOLDER_URL } from "../../../entities/product/model/productConstants.js";
import { ProductPriceDisplay } from "../../../entities/product/ui/ProductPriceDisplay.jsx";
import { CART_PAGE_UI, COMMON_UI, PRODUCT_PROMO_CODE_UI } from "../../../shared/config/appUiCopy.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";
import { AppIcon, Trash2 } from "../../../shared/ui/icon/index.js";

import "./CartLineItem.css";

/** Паритет mobile `CART_LINE_IMAGE_SIZE`. */
const CART_LINE_IMAGE_SIZE_PX = 72;

/**
 * @param {{
 *   line: import('../../../entities/cart/lib/selectCartLines.js').CartLine;
 *   selected: boolean;
 *   onToggleSelected: (productId: string) => void;
 *   onProductClick?: (product: import('../../../entities/product/model/types.js').ProductFromApi) => void;
 * }} props
 */
export function CartLineItem({
  line,
  selected,
  onToggleSelected,
  onProductClick,
}) {
  const { setItemQuantity, removeItem } = useCart();
  const [imageFailed, setImageFailed] = useState(false);
  const product = line.product;
  const heading = product?.productName?.trim() || COMMON_UI.EM_DASH;
  const lineTotalText = formatPriceRub(line.lineTotal);
  const purchaseLimit = getProductPurchaseLimit(product);
  const stockHint = getCartLineStockHint(purchaseLimit, line.quantity);
  const resolvedImage = resolveProductImageUrl(product);
  const imageUrl =
    imageFailed || !resolvedImage
      ? PRODUCT_IMAGE_PLACEHOLDER_URL
      : resolvedImage;

  const handleDecrease = () => {
    if (line.quantity <= 1) {
      removeItem(line.productId);
      return;
    }
    setItemQuantity(line.productId, line.quantity - 1);
  };

  const handleIncrease = () => {
    if (purchaseLimit > 0 && line.quantity >= purchaseLimit) {
      return;
    }
    setItemQuantity(line.productId, line.quantity + 1);
  };

  const handleRemove = () => removeItem(line.productId);
  const handleOpenProduct = () => {
    if (product) {
      onProductClick?.(product);
    }
  };
  const increaseDisabled = purchaseLimit > 0 && line.quantity >= purchaseLimit;

  return (
    <article className="cart-line">
      <div className="cart-line__card">
        <div className="cart-line__main">
          {product ? (
            <button
              type="button"
              className="cart-line__image-wrap"
              onClick={handleOpenProduct}
              aria-label={heading}
            >
              <img
                className="cart-line__image"
                src={imageUrl}
                alt=""
                width={CART_LINE_IMAGE_SIZE_PX}
                height={CART_LINE_IMAGE_SIZE_PX}
                loading="lazy"
                decoding="async"
                onError={() => setImageFailed(true)}
              />
            </button>
          ) : (
            <span className="cart-line__image-wrap">
              <img
                className="cart-line__image"
                src={imageUrl}
                alt=""
                width={CART_LINE_IMAGE_SIZE_PX}
                height={CART_LINE_IMAGE_SIZE_PX}
                loading="lazy"
                decoding="async"
                onError={() => setImageFailed(true)}
              />
            </span>
          )}

          <div className="cart-line__info">
            {product ? (
              <ProductPriceDisplay product={product} showLabel={false} variant="cart" />
            ) : null}
            {line.isWholesaleApplied ? (
              <p className="cart-line__wholesale-badge" role="status">
                {CART_PAGE_UI.WHOLESALE_LINE_BADGE}
              </p>
            ) : null}
            {line.isPromoApplied ? (
              <p className="cart-line__wholesale-badge" role="status">
                {PRODUCT_PROMO_CODE_UI.CART_PROMO_LABEL}
                {line.promoDiscountPercent != null
                  ? ` ${PRODUCT_PROMO_CODE_UI.CART_PROMO_PERCENT(line.promoDiscountPercent)}`
                  : ""}
              </p>
            ) : null}
            {stockHint ? <p className="cart-line__stock-hint">{stockHint}</p> : null}
            {product ? (
              <button
                type="button"
                className="cart-line__name-button"
                onClick={handleOpenProduct}
              >
                {heading}
              </button>
            ) : (
              <p className="cart-line__name">{heading}</p>
            )}
          </div>
        </div>

        <div className="cart-line__action-row">
          <button
            type="button"
            className="cart-line__remove"
            onClick={handleRemove}
            aria-label={CART_PAGE_UI.REMOVE_LINE_ARIA}
          >
            <AppIcon icon={Trash2} size="md" />
          </button>

          <div className="cart-line__stepper-wrap">
            <div className="cart-line__stepper" role="group">
              <button
                type="button"
                className="cart-line__step-button"
                onClick={handleDecrease}
              >
                −
              </button>
              <span className="cart-line__quantity">{line.quantity}</span>
              <button
                type="button"
                className="cart-line__step-button"
                onClick={handleIncrease}
                disabled={increaseDisabled}
              >
                +
              </button>
            </div>
          </div>

          <span className="cart-line__total">{lineTotalText}</span>
        </div>
      </div>

      <button
        type="button"
        className={[
          "cart-line__select",
          selected && "cart-line__select_checked",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => onToggleSelected(line.productId)}
        role="checkbox"
        aria-checked={selected}
        aria-label={CART_PAGE_UI.SELECT_LINE_ARIA}
      />
    </article>
  );
}
