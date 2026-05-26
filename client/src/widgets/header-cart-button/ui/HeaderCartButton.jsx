import { useCart } from "../../../entities/cart/model/useCart.js";
import { HEADER_CART_BUTTON_UI } from "../../../shared/config/appUiCopy.js";

import "./HeaderCartButton.css";

/**
 * Кнопка-индикатор корзины в шапке. Показывает бейдж с числом позиций.
 *
 * @param {{ onClick: () => void; isActive?: boolean }} props
 */
export function HeaderCartButton({ onClick, isActive = false }) {
  const { totalCount } = useCart();
  const hasItems = totalCount > 0;
  const className = [
    "header-cart-button",
    isActive && "header-cart-button--active",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      aria-label={HEADER_CART_BUTTON_UI.ARIA}
      aria-current={isActive ? "page" : undefined}
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
