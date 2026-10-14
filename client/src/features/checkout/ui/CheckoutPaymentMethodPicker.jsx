import { resolveCheckoutPaymentMethodOptions } from "@izibuy/shared-lib";

import { ORDER_PAYMENT_METHOD_LABEL_RU } from "../lib/checkoutPaymentMethodCardTheme.js";
import { CHECKOUT_FORM_UI } from "../../../shared/config/appUiCopy.js";

import "./CheckoutPaymentMethodPicker.css";

/**
 * @param {{
 *   value: string;
 *   onChange: (method: string) => void;
 *   disabled?: boolean;
 *   legend: string;
 *   cardPrepaidAvailable?: boolean;
 *   allowedMethods?: string[] | null;
 *   hiddenMethods?: string[];
 * }} props
 */
export function CheckoutPaymentMethodPicker({
  value,
  onChange,
  disabled = false,
  legend,
  cardPrepaidAvailable = false,
  allowedMethods = null,
  hiddenMethods = [],
}) {
  // Что доступно, в каком порядке и почему недоступно — считает shared-lib,
  // одинаково для сайта и приложения. Выбранный способ в начало не прыгает:
  // ряд не перестраивается под пальцем при каждом нажатии.
  const { orderedMethods, availableMethods, notAcceptedBySeller } =
    resolveCheckoutPaymentMethodOptions({
      cardPrepaidAvailable,
      allowedMethods,
      hiddenMethods,
    });

  // Выбирать не из чего — одна строка вместо ряда, где половина карточек
  // бледные «не принимает». Сам способ форма выставляет сама.
  if (availableMethods.length === 1) {
    return (
      <div className="checkout-payment-method-picker">
        <div className="checkout-payment-method-picker__legend">{legend}</div>
        <div className="checkout-payment-method-picker__single" role="note">
          {ORDER_PAYMENT_METHOD_LABEL_RU[availableMethods[0]]}
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-payment-method-picker">
      <div className="checkout-payment-method-picker__legend">{legend}</div>
      <div
        className="checkout-payment-method-picker__scroll"
        role="radiogroup"
        aria-label={legend}
      >
        {orderedMethods.map((method) => {
          const isSelectable = availableMethods.includes(method);
          const isSelected = value === method;
          const isLocked = !isSelectable;
          // «Скоро» и «продавец не принимает» — разные вещи. Показывать
          // первое вместо второго значит обещать покупателю, что способ
          // вот-вот появится, хотя у этого продавца он не появится никогда.
          const lockReason = notAcceptedBySeller.includes(method)
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
                <span className="checkout-payment-method-picker__title">
                  {ORDER_PAYMENT_METHOD_LABEL_RU[method]}
                </span>
                {isLocked ? (
                  <span className="checkout-payment-method-picker__soon">
                    {lockReason}
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
