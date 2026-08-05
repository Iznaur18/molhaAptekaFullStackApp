import {
  listCheckoutShippingProviderOptions,
  listCheckoutShippingServiceOptions,
  hasCheckoutLiveCarrierProviders,
  resolveCheckoutShippingProviderLabel,
  CHECKOUT_SHIPPING_PROVIDER_SELLER,
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
 * Службы доставки в чекауте.
 * Live сейчас только «Продавцом»; перевозчики и типы выдачи — после подключения ключей.
 *
 * @param {{ disabled?: boolean }} props
 */
export function CheckoutShippingProviderPicker({ disabled = false }) {
  const providerOptions = listCheckoutShippingProviderOptions();
  const serviceOptions = listCheckoutShippingServiceOptions();
  const showCarrierServices = hasCheckoutLiveCarrierProviders() && serviceOptions.length > 0;

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
          const label = resolveCheckoutShippingProviderLabel(option.id, {
            sellerLabel: CHECKOUT_FORM_UI.SHIPPING_PROVIDER_SELLER,
          });
          const className = [
            "checkout-shipping-provider-picker__card",
            isSelected ? "checkout-shipping-provider-picker__card--selected" : "",
            !isSelected ? "checkout-shipping-provider-picker__card--idle" : "",
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
              aria-disabled={disabled}
              disabled={disabled}
            >
              <span className="checkout-shipping-provider-picker__label">{label}</span>
            </button>
          );
        })}
      </div>

      {showCarrierServices ? (
        <>
          <div className="checkout-shipping-provider-picker__legend checkout-shipping-provider-picker__legend--sub">
            {CHECKOUT_FORM_UI.LABEL_SHIPPING_SERVICE}
          </div>
          <div
            className="checkout-shipping-provider-picker__row"
            role="radiogroup"
            aria-label={CHECKOUT_FORM_UI.LABEL_SHIPPING_SERVICE}
          >
            {serviceOptions.map((option) => {
              const label = SERVICE_LABEL[option.id] ?? option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  className="checkout-shipping-provider-picker__chip"
                  role="radio"
                  aria-checked={false}
                  disabled={disabled}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </>
      ) : null}

      <p className="checkout-shipping-provider-picker__hint">
        {CHECKOUT_FORM_UI.SHIPPING_PROVIDER_HINT}
      </p>
    </div>
  );
}
