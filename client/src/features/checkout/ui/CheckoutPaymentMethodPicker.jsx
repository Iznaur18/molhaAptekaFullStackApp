import {
  ORDER_PAYMENT_METHOD_LABEL_RU,
  ORDER_PAYMENT_METHODS_SELECTABLE,
} from "../lib/checkoutPaymentMethodCardTheme.js";

import "./CheckoutPaymentMethodPicker.css";

/**
 * @param {{
 *   value: string;
 *   onChange: (method: string) => void;
 *   disabled?: boolean;
 *   legend: string;
 * }} props
 */
export function CheckoutPaymentMethodPicker({
  value,
  onChange,
  disabled = false,
  legend,
}) {
  return (
    <div className="checkout-payment-method-picker">
      <div className="checkout-payment-method-picker__legend">{legend}</div>
      <div className="checkout-payment-method-picker__scroll" role="radiogroup" aria-label={legend}>
        {ORDER_PAYMENT_METHODS_SELECTABLE.map((method) => {
          const isSelected = value === method;
          const cardClassName = [
            "checkout-payment-method-picker__card",
            `checkout-payment-method-picker__card--${method}`,
            isSelected ? "checkout-payment-method-picker__card--selected" : "",
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
              disabled={disabled}
              onClick={() => onChange(method)}
            >
              <span className="checkout-payment-method-picker__label">
                {ORDER_PAYMENT_METHOD_LABEL_RU[method]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
