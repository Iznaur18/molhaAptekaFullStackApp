import { useCart } from "../../../entities/cart/model/useCart.js";
import { resolveProductImageUrls } from "../../../entities/product/lib/resolveProductImageUrls.js";
import { PRODUCT_IMAGE_PLACEHOLDER_URL } from "../../../entities/product/model/productConstants.js";
import {
  CART_PAGE_UI,
  COMMON_UI,
} from "../../../shared/config/appUiCopy.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";

import "./CartLineItem.css";

const pickImageUrl = (product) => {
  const first = resolveProductImageUrls(product)[0];
  return typeof first === "string" && /^https?:\/\//i.test(first.trim())
    ? first.trim()
    : PRODUCT_IMAGE_PLACEHOLDER_URL;
};

/**
 * @param {{
 *   line: import('../../../entities/cart/lib/selectCartLines.js').CartLine;
 *   onProductClick?: (product: import('../../../entities/product/model/types.js').ProductFromApi) => void;
 * }} props
 */
export function CartLineItem({ line, onProductClick }) {
  const { setItemQuantity, removeItem } = useCart();
  const product = line.product;
  const heading = product?.productName?.trim() || COMMON_UI.EM_DASH;
  const unitPriceText = formatPriceRub(product?.productPrice);
  const lineTotalText = formatPriceRub(line.lineTotal);

  const handleDecrease = () => {
    if (line.quantity <= 1) {
      removeItem(line.productId);
      return;
    }
    setItemQuantity(line.productId, line.quantity - 1);
  };

  const handleIncrease = () =>
    setItemQuantity(line.productId, line.quantity + 1);

  const handleRemove = () => removeItem(line.productId);

  return (
    <article className="cart-line">
      <img
        className="cart-line__image"
        src={pickImageUrl(product)}
        alt=""
        loading="lazy"
        decoding="async"
      />
      <div className="cart-line__info">
        {product ? (
          <button
            type="button"
            className="cart-line__heading-button"
            onClick={() => onProductClick?.(product)}
          >
            {heading}
          </button>
        ) : (
          <h3 className="cart-line__heading">{heading}</h3>
        )}
        {line.isMissing ? (
          <p className="cart-line__missing">
            {CART_PAGE_UI.PRODUCT_DELETED_OR_HIDDEN}
          </p>
        ) : (
          <p className="cart-line__unit-price">{unitPriceText}</p>
        )}
      </div>
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
        >
          +
        </button>
      </div>
      <span className="cart-line__total">{lineTotalText}</span>
      <button
        type="button"
        className="cart-line__remove"
        onClick={handleRemove}
        aria-label={CART_PAGE_UI.REMOVE_LINE_ARIA}
      >
        ×
      </button>
    </article>
  );
}
