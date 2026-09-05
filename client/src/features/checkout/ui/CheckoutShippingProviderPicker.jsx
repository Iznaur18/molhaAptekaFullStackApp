import { useEffect, useRef } from "react";
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
import { resolveClientViewerRegionCode } from "../../../entities/region/lib/viewerRegion.js";
import { useAuthSession } from "../../../entities/user/model/useAuthSession.js";

import "./CheckoutShippingProviderPicker.css";

const SERVICE_LABEL = {
  [SHIPPING_SERVICE_COURIER]: CHECKOUT_FORM_UI.SHIPPING_SERVICE_COURIER,
  [SHIPPING_SERVICE_PICKUP_POINT]: CHECKOUT_FORM_UI.SHIPPING_SERVICE_PICKUP_POINT,
};

const COURIER_OPTION_ID = "gitorg-courier";

/**
 * Службы доставки в чекауте.
 * Live сейчас только «Продавцом»; перевозчики и типы выдачи — после подключения ключей.
 *
 * @param {{ disabled?: boolean; courierDelivery?: "courier" | "seller" | "mixed" | null }} props
 */
export function CheckoutShippingProviderPicker({
  disabled = false,
  courierDelivery = null,
}) {
  const { user } = useAuthSession();
  const scrollRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const selectedRef = useRef(/** @type {HTMLButtonElement | null} */ (null));
  // Локальные службы вроде ЛОБО показываем только там, где они возят.
  const regionCode = resolveClientViewerRegionCode(user?.userRegionCode);
  const providerOptions = listCheckoutShippingProviderOptions({ regionCode });
  const serviceOptions = listCheckoutShippingServiceOptions();
  const showCarrierServices =
    hasCheckoutLiveCarrierProviders(regionCode) && serviceOptions.length > 0;

  const isCourierSelected =
    courierDelivery === "courier" || courierDelivery === "mixed";
  const isSellerSelected =
    courierDelivery === "seller" || courierDelivery === "mixed";

  const cards = [
    {
      id: COURIER_OPTION_ID,
      label: CHECKOUT_FORM_UI.SHIPPING_PROVIDER_COURIER,
      selected: isCourierSelected,
      locked: false,
    },
    ...providerOptions.map((option) => {
      const isSeller = option.id === CHECKOUT_SHIPPING_PROVIDER_SELLER;
      const selected = isSeller ? isSellerSelected : false;
      const label = resolveCheckoutShippingProviderLabel(option.id, {
        sellerLabel: CHECKOUT_FORM_UI.SHIPPING_PROVIDER_SELLER,
      });
      return {
        id: option.id,
        label,
        selected,
        locked: !option.live,
        soon: !option.live,
      };
    }),
  ].sort((a, b) => Number(b.selected) - Number(a.selected));

  useEffect(() => {
    const node = selectedRef.current;
    if (!node || typeof node.scrollIntoView !== "function") {
      return;
    }
    try {
      node.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    } catch {
      node.scrollIntoView();
    }
  }, [courierDelivery]);

  return (
    <div className="checkout-shipping-provider-picker">
      <div className="checkout-shipping-provider-picker__legend">
        {CHECKOUT_FORM_UI.LABEL_SHIPPING_PROVIDER}
      </div>
      <div
        ref={scrollRef}
        className="checkout-shipping-provider-picker__scroll"
        role="radiogroup"
        aria-label={CHECKOUT_FORM_UI.LABEL_SHIPPING_PROVIDER}
      >
        {cards.map((card) => {
          const className = [
            "checkout-shipping-provider-picker__card",
            card.selected
              ? "checkout-shipping-provider-picker__card--selected"
              : "checkout-shipping-provider-picker__card--idle",
            card.locked
              ? "checkout-shipping-provider-picker__card--locked"
              : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={card.id}
              ref={card.selected ? selectedRef : undefined}
              type="button"
              className={className}
              role="radio"
              aria-checked={card.selected}
              aria-disabled
              disabled
            >
              <span className="checkout-shipping-provider-picker__label">
                {card.label}
                {card.soon ? (
                  <span className="checkout-shipping-provider-picker__soon">
                    {CHECKOUT_FORM_UI.SHIPPING_PROVIDER_SOON}
                  </span>
                ) : null}
              </span>
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
        {CHECKOUT_FORM_UI.SHIPPING_PROVIDER_CHOSEN_BY_SELLER}
      </p>
    </div>
  );
}
