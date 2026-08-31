import { Link } from "react-router-dom";

import { CART_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";

/**
 * Итог и оформление на всю корзину.
 *
 * Заказ теперь один, даже если отправлений несколько: покупатель выбирает
 * способ у каждого продавца, но платит и оформляет один раз.
 *
 * @param {{
 *   summary: { selectedLines: Array<{ quantity?: number }>; selectedTotal: number; checkoutBlockReason?: string };
 *   canCheckout: boolean;
 *   onCheckout: () => void;
 * }} props
 */
export function CartCheckoutBar({ summary, canCheckout, onCheckout }) {
  const selectedItemsCount = summary.selectedLines.reduce(
    (sum, line) => sum + (Number(line?.quantity) || 0),
    0,
  );

  if (selectedItemsCount === 0 && !summary.checkoutBlockReason) {
    return null;
  }

  return (
    <section className="cart-page__checkout-bar">
      <div className="cart-page__dock-total-row">
        <span className="cart-page__payable-label">
          {CART_PAGE_UI.PAYABLE_LABEL}
        </span>
        <span className="cart-page__total-value">
          {formatPriceRub(summary.selectedTotal)}
        </span>
      </div>

      {!canCheckout && summary.checkoutBlockReason ? (
        <p className="cart-page__checkout-hint">{summary.checkoutBlockReason}</p>
      ) : null}

      <button
        type="button"
        className="cart-page__checkout-cta"
        disabled={!canCheckout}
        onClick={onCheckout}
      >
        {CART_PAGE_UI.CHECKOUT_OPEN}
      </button>

      <p className="cart-page__checkout-legal">
        {CART_PAGE_UI.CHECKOUT_LEGAL_HINT_PREFIX}
        <Link className="cart-page__checkout-legal-link" to="/legal/privacy">
          {CART_PAGE_UI.CHECKOUT_LEGAL_PRIVACY_LINK}
        </Link>
        {CART_PAGE_UI.CHECKOUT_LEGAL_HINT_MIDDLE}
        <Link className="cart-page__checkout-legal-link" to="/legal/offer">
          {CART_PAGE_UI.CHECKOUT_LEGAL_OFFER_LINK}
        </Link>
      </p>
    </section>
  );
}
