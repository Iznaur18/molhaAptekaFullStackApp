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
import { SHIPPING_PROVIDER_CDEK } from "@molha/api-contract";

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
 *
 * Внутри «Доставки» покупатель выбирает службу из тех, что разрешил продавец:
 * его собственную доставку (или курьеров Gitorg) либо СДЭК, если продавец
 * подключил договор и включил тумблер. Остальные перевозчики пока «скоро».
 *
 * @param {{
 *   disabled?: boolean;
 *   courierDelivery?: "courier" | "seller" | "mixed" | null;
 *   cdekAvailable?: boolean;
 *   sellerDeliveryAvailable?: boolean;
 *   cdekSelected?: boolean;
 *   onSelectCdek?: (chosen: boolean) => void;
 * }} props
 */
export function CheckoutShippingProviderPicker({
  disabled = false,
  courierDelivery = null,
  cdekAvailable = false,
  sellerDeliveryAvailable = true,
  cdekSelected = false,
  onSelectCdek = null,
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
  const isSellerSelected = courierDelivery === "seller" || courierDelivery === "mixed";

  // Переключаться есть смысл, только когда у продавца две службы сразу.
  const canSwitch =
    cdekAvailable && sellerDeliveryAvailable && typeof onSelectCdek === "function";

  const cards = [
    {
      id: COURIER_OPTION_ID,
      label: CHECKOUT_FORM_UI.SHIPPING_PROVIDER_COURIER,
      selected: !cdekSelected && isCourierSelected,
      locked: false,
      selectable: canSwitch && isCourierSelected,
    },
    ...providerOptions
      // СДЭК решает продавец, а не общий список: ниже своя карточка.
      .filter((option) => option.id !== SHIPPING_PROVIDER_CDEK)
      .map((option) => {
        const isSeller = option.id === CHECKOUT_SHIPPING_PROVIDER_SELLER;
        const label = resolveCheckoutShippingProviderLabel(option.id, {
          sellerLabel: CHECKOUT_FORM_UI.SHIPPING_PROVIDER_SELLER,
        });
        return {
          id: option.id,
          label,
          selected: isSeller ? !cdekSelected && isSellerSelected : false,
          locked: !option.live,
          soon: !option.live,
          selectable: isSeller && canSwitch && isSellerSelected,
        };
      }),
    ...(cdekAvailable
      ? [
          {
            id: SHIPPING_PROVIDER_CDEK,
            label: CHECKOUT_FORM_UI.SHIPPING_PROVIDER_CDEK,
            selected: cdekSelected,
            locked: false,
            selectable: canSwitch,
          },
        ]
      : []),
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
            card.locked ? "checkout-shipping-provider-picker__card--locked" : "",
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
              aria-disabled={!card.selectable || disabled}
              disabled={!card.selectable || disabled}
              onClick={() => onSelectCdek?.(card.id === SHIPPING_PROVIDER_CDEK)}
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
    </div>
  );
}
