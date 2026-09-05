import { Link } from "react-router-dom";

import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";
import { CART_DELIVERY_FEE_UI, CART_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import { CartLineItem } from "./CartLineItem.jsx";
import { CartSelectAllRow } from "./CartSelectAllRow.jsx";

import "./CartFulfillmentSection.css";

/**
 * @param {{
 *   title: string;
 *   lines: import('../../../entities/cart/lib/selectCartLines.js').CartLine[];
 *   selectedCount: number;
 *   areAllSelected: boolean;
 *   onToggleAll: () => void;
 *   isLineSelected: (productId: string) => boolean;
 *   onToggleSelected: (productId: string) => void;
 *   onProductClick: (product: unknown) => void;
 *   summary: {
 *     selectedTotal: number;
 *     selectedListTotal: number;
 *     selectedDiscount: number;
 *     selectedPromoDiscount: number;
 *     selectedWholesaleDiscount: number;
 *     fullTotal: number;
 *     hasPartialSelection: boolean;
 *     checkoutBlockReason: string | null;
 *     selectedLines: unknown[];
 *   };
 *   canCheckout: boolean;
 *   onCheckout: () => void;
 *   showDeliveryFeeNote?: boolean;
 * }} props
 */
export function CartFulfillmentSection({
  title,
  lines,
  selectedCount,
  areAllSelected,
  onToggleAll,
  isLineSelected,
  onToggleSelected,
  onProductClick,
  summary,
  canCheckout,
  onCheckout,
  deliveryFee = null,
  showDeliveryFeeNote = false,
}) {
  if (lines.length === 0) {
    return null;
  }

  const selectedItemsCount = summary.selectedLines.reduce(
    (sum, line) => sum + (Number(line?.quantity) || 0),
    0,
  );

  return (
    <section className="cart-fulfillment">
      <header className="cart-fulfillment__header">
        <h2 className="cart-fulfillment__title">{title}</h2>
      </header>

        {deliveryFee ? (
          <div className="cart-fulfillment__fee">
            <span className="cart-fulfillment__fee-label">
              {CART_DELIVERY_FEE_UI.LABEL}
            </span>
            <div className="cart-fulfillment__fee-controls">
              <button
                type="button"
                aria-label={CART_DELIVERY_FEE_UI.DECREASE}
                onClick={() => deliveryFee.onChange(deliveryFee.value - 25)}
                disabled={deliveryFee.value <= CART_DELIVERY_FEE_UI.MIN_RUB}
              >
                −
              </button>
              <span className="cart-fulfillment__fee-value">
                {formatPriceRub(deliveryFee.value)}
              </span>
              <button
                type="button"
                aria-label={CART_DELIVERY_FEE_UI.INCREASE}
                onClick={() => deliveryFee.onChange(deliveryFee.value + 25)}
              >
                +
              </button>
            </div>
            <span className="cart-fulfillment__fee-hint">
              {CART_DELIVERY_FEE_UI.HINT}
            </span>
          </div>
        ) : null}

      <CartSelectAllRow
        selectedCount={selectedCount}
        totalCount={lines.length}
        areAllSelected={areAllSelected}
        onToggleAll={onToggleAll}
      />

      <ul className="cart-page__list" role="list">
        {lines.map((line) => (
          <li key={line.productId} className="cart-page__item" role="listitem">
            <CartLineItem
              line={line}
              selected={isLineSelected(line.productId)}
              onToggleSelected={onToggleSelected}
              onProductClick={onProductClick}
            />
          </li>
        ))}
      </ul>

      <div className="cart-fulfillment__dock">
        <div className="cart-fulfillment__dock-top">
          <div className="cart-page__dock-total">
            <div className="cart-page__dock-total-row cart-page__dock-total-row--meta">
              <span className="cart-page__total-label">
                {CART_PAGE_UI.TOTAL_LABEL}
              </span>
              <span className="cart-page__items-count">
                {CART_PAGE_UI.ITEMS_COUNT(selectedItemsCount)}
              </span>
            </div>
            {summary.selectedDiscount > 0 || summary.selectedPromoDiscount > 0 ? (
              <div className="cart-page__dock-total-row cart-page__dock-total-row--meta">
                <span className="cart-page__total-label">
                  {CART_PAGE_UI.PRICE_LABEL}
                </span>
                <span className="cart-page__list-price">
                  {formatPriceRub(summary.selectedListTotal)}
                </span>
              </div>
            ) : null}
            {summary.selectedDiscount > 0 ? (
              <div className="cart-page__dock-total-row cart-page__dock-total-row--discount">
                <span className="cart-page__discount-label">
                  {CART_PAGE_UI.DISCOUNT_LABEL}
                </span>
                <span className="cart-page__discount-value">
                  {CART_PAGE_UI.DISCOUNT_AMOUNT(
                    formatPriceRub(summary.selectedDiscount),
                  )}
                </span>
              </div>
            ) : null}
            {summary.selectedPromoDiscount > 0 ? (
              <div className="cart-page__dock-total-row cart-page__dock-total-row--discount">
                <span className="cart-page__discount-label">
                  {CART_PAGE_UI.PROMO_DISCOUNT_LABEL}
                </span>
                <span className="cart-page__discount-value">
                  {CART_PAGE_UI.DISCOUNT_AMOUNT(
                    formatPriceRub(summary.selectedPromoDiscount),
                  )}
                </span>
              </div>
            ) : null}
            {summary.selectedWholesaleDiscount > 0 ? (
              <div className="cart-page__dock-total-row cart-page__dock-total-row--discount">
                <span className="cart-page__discount-label">
                  {CART_PAGE_UI.WHOLESALE_DISCOUNT_LABEL}
                </span>
                <span className="cart-page__discount-value">
                  {CART_PAGE_UI.DISCOUNT_AMOUNT(
                    formatPriceRub(summary.selectedWholesaleDiscount),
                  )}
                </span>
              </div>
            ) : null}
            {showDeliveryFeeNote ? (
              <div className="cart-page__dock-total-row cart-page__dock-total-row--meta">
                <span className="cart-page__discount-label">
                  {CART_PAGE_UI.DELIVERY_FEE_LABEL}
                </span>
                <span className="cart-page__delivery-fee-value">
                  {CART_PAGE_UI.DELIVERY_FEE_VALUE}
                </span>
              </div>
            ) : null}
            <div className="cart-page__dock-total-row">
              <span className="cart-page__payable-label">
                {CART_PAGE_UI.PAYABLE_LABEL}
              </span>
              <span className="cart-page__total-value">
                {formatPriceRub(summary.selectedTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Оформление по продавцу: отдельный заказ и оплата на каждую секцию. */}
        {onCheckout ? (
          <>
            {!canCheckout && summary.checkoutBlockReason ? (
              <p className="cart-page__checkout-hint">
                {summary.checkoutBlockReason}
              </p>
            ) : null}

            <button
              type="button"
              className="cart-page__checkout-cta"
              disabled={!canCheckout}
              onClick={onCheckout}
            >
              {CART_PAGE_UI.CHECKOUT_SELLER}
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
          </>
        ) : null}
      </div>
    </section>
  );
}
