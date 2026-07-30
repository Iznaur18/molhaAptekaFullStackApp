import {
  listCheckoutShippingProviderOptions,
  resolveCheckoutShippingProviderLabel,
  CHECKOUT_SHIPPING_PROVIDER_SELLER,
  CHECKOUT_SHIPPING_SERVICE_OPTIONS,
  SHIPPING_SERVICE_COURIER,
  SHIPPING_SERVICE_PICKUP_POINT,
} from "../lib/checkoutShippingProviderOptions.js";
import { CHECKOUT_FORM_UI } from "../../../shared/config/appUiCopy.js";

import "./CheckoutShippingProviderPicker.css";

const SERVICE_LABEL = {
  [SHIPPING_SERVICE_COURIER]: CHECKOUT_FORM_UI.SHIPPING_SERVICE_COURIER,
  [SHIPPING_SERVICE_PICKUP_POINT]: CHECKOUT_FORM_UI.SHIPPING_SERVICE_PICKUP_POINT,
};

/**
 * Дизайн-каркас служб доставки. Сейчас live только «Продавцом»;
 * СДЭК / Яндекс / Почта и типы ПВЗ/курьер — disabled «Скоро».
 *
 * @param {{ disabled?: boolean }} props
 */
export function CheckoutShippingProviderPicker({ disabled = false }) {
  const providerOptions = listCheckoutShippingProviderOptions();

  return (
    <div className="checkout-shipping-provider-picker">
      <div className="checkout-shipping-provider-picker__legend">
        {CHECKOUT_FORM_UI.LABEL_SHIPPING_PROVIDER}
      </div>
      <div
        className="checkout-shipping-provider-picker__scroll"
        role="radiogroup"
        aria-label={CHECKOUT_FORM_UI.LABEL_SHIPPING_PROVIDER}
      >
        {providerOptions.map((option) => {
          const isSelected = option.id === CHECKOUT_SHIPPING_PROVIDER_SELLER;
          const isLocked = !option.live;
          const label = resolveCheckoutShippingProviderLabel(option.id, {
            sellerLabel: CHECKOUT_FORM_UI.SHIPPING_PROVIDER_SELLER,
          });
          const className = [
            "checkout-shipping-provider-picker__card",
            isSelected ? "checkout-shipping-provider-picker__card--selected" : "",
            isLocked ? "checkout-shipping-provider-picker__card--locked" : "",
            !isLocked && !isSelected
              ? "checkout-shipping-provider-picker__card--idle"
              : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={option.id}
              type="button"
              className={className}
              role="radio"
              aria-checked={isSelected}
              aria-disabled={isLocked || disabled}
              disabled={disabled || isLocked}
              title={
                isLocked ? CHECKOUT_FORM_UI.SHIPPING_PROVIDER_SOON : undefined
              }
            >
              <span className="checkout-shipping-provider-picker__label">
                {label}
                {isLocked ? (
                  <span className="checkout-shipping-provider-picker__soon">
                    {" "}
                    ({CHECKOUT_FORM_UI.SHIPPING_PROVIDER_SOON})
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>

      <div className="checkout-shipping-provider-picker__legend checkout-shipping-provider-picker__legend--sub">
        {CHECKOUT_FORM_UI.LABEL_SHIPPING_SERVICE}
      </div>
      <div
        className="checkout-shipping-provider-picker__row"
        role="radiogroup"
        aria-label={CHECKOUT_FORM_UI.LABEL_SHIPPING_SERVICE}
      >
        {CHECKOUT_SHIPPING_SERVICE_OPTIONS.map((option) => {
          const label = SERVICE_LABEL[option.id] ?? option.id;
          return (
            <button
              key={option.id}
              type="button"
              className="checkout-shipping-provider-picker__chip checkout-shipping-provider-picker__chip--locked"
              role="radio"
              aria-checked={false}
              aria-disabled
              disabled
              title={CHECKOUT_FORM_UI.SHIPPING_PROVIDER_SOON}
            >
              {label}
              <span className="checkout-shipping-provider-picker__soon">
                {" "}
                ({CHECKOUT_FORM_UI.SHIPPING_PROVIDER_SOON})
              </span>
            </button>
          );
        })}
      </div>

      <p className="checkout-shipping-provider-picker__hint">
        {CHECKOUT_FORM_UI.SHIPPING_PROVIDER_HINT}
      </p>
    </div>
  );
}
