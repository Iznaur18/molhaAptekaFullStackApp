import { useCart } from "../../../entities/cart/model/useCart.js";
import { HEADER_CART_BUTTON_UI } from "../../../shared/config/appUiCopy.js";

import "./HeaderCartButton.css";

/**
 * Кнопка-индикатор корзины в шапке. Показывает бейдж с числом позиций.
 *
 * @param {{ onClick: () => void }} props
 */
export function HeaderCartButton({ onClick }) {
  const { totalCount } = useCart();
  const hasItems = totalCount > 0;

  return (
    <button
      type="button"
      className="header-cart-button"
      onClick={onClick}
      aria-label={HEADER_CART_BUTTON_UI.ARIA}
    >
      <span aria-hidden="true">{HEADER_CART_BUTTON_UI.LABEL}</span>
      {hasItems ? (
        <span
          className="header-cart-button__badge"
          aria-label={HEADER_CART_BUTTON_UI.COUNT_ARIA}
        >
          {totalCount}
        </span>
      ) : null}
    </button>
  );
}
