import {
  ORDER_PAYMENT_METHOD_CARD_PREPAID,
  ORDER_PAYMENT_METHOD_LABEL_RU,
  ORDER_PAYMENT_METHODS,
  ORDER_PAYMENT_METHODS_SELECTABLE,
} from "../lib/checkoutPaymentMethodCardTheme.js";
import { CHECKOUT_FORM_UI } from "../../../shared/config/appUiCopy.js";

import "./CheckoutPaymentMethodPicker.css";

const SELECTABLE_SET = new Set(ORDER_PAYMENT_METHODS_SELECTABLE);

/**
 * @param {{
 *   value: string;
 *   onChange: (method: string) => void;
 *   disabled?: boolean;
 *   legend: string;
 *   cardPrepaidAvailable?: boolean;
 *   allowedMethods?: string[];
 * }} props
 */
export function CheckoutPaymentMethodPicker({
  value,
  onChange,
  disabled = false,
  legend,
  cardPrepaidAvailable = false,
  allowedMethods = null,
}) {
  const platformSelectable = cardPrepaidAvailable
    ? new Set([...SELECTABLE_SET, ORDER_PAYMENT_METHOD_CARD_PREPAID])
    : SELECTABLE_SET;
  // Продавец сужает то, что вообще умеет площадка, но не расширяет:
  // «картой заранее» без эквайринга не заработает от его галочки.
  const selectableSet = Array.isArray(allowedMethods)
    ? new Set(
        [...platformSelectable].filter((method) => allowedMethods.includes(method)),
      )
    : platformSelectable;
  return (
    <div className="checkout-payment-method-picker">
      <div className="checkout-payment-method-picker__legend">{legend}</div>
      <div className="checkout-payment-method-picker__scroll" role="radiogroup" aria-label={legend}>
        {ORDER_PAYMENT_METHODS.map((method) => {
          const isSelectable = selectableSet.has(method);
          const isSelected = value === method;
          const isLocked = !isSelectable;
          // «Скоро» и «продавец не принимает» — разные вещи. Показывать
          // первое вместо второго значит обещать покупателю, что способ
          // вот-вот появится, хотя у этого продавца он не появится никогда.
          const lockReason =
            isLocked && platformSelectable.has(method)
              ? CHECKOUT_FORM_UI.PAYMENT_METHOD_NOT_ACCEPTED
              : CHECKOUT_FORM_UI.PAYMENT_METHOD_CARD_SOON;
          const cardClassName = [
            "checkout-payment-method-picker__card",
            `checkout-payment-method-picker__card--${method}`,
            isSelected ? "checkout-payment-method-picker__card--selected" : "",
            isLocked ? "checkout-payment-method-picker__card--locked" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={method}
              type="button"
              className={cardClassName}
              role="radio"
              aria-checked={isSelected}
              aria-disabled={isLocked || disabled}
              disabled={disabled || isLocked}
              onClick={() => {
                if (!isSelectable) {
                  return;
                }
                onChange(method);
              }}
            >
              <span className="checkout-payment-method-picker__label">
                {ORDER_PAYMENT_METHOD_LABEL_RU[method]}
                {isLocked ? (
                  <span className="checkout-payment-method-picker__soon">
                    {" "}
                    ({lockReason})
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
