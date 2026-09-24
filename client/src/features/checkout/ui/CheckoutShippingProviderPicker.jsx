import { useEffect, useRef } from "react";
import { Bike, Store, Truck } from "lucide-react";
import {
  listCheckoutShippingProviderOptions,
  listCheckoutShippingServiceOptions,
  hasCheckoutLiveCarrierProviders,
  resolveCheckoutShippingProviderLabel,
  CHECKOUT_SHIPPING_PROVIDER_SELLER,
  SHIPPING_SERVICE_COURIER,
  SHIPPING_SERVICE_PICKUP_POINT,
} from "../lib/checkoutShippingProviderOptions.js";
import {
  PRODUCT_DELIVERY_CARRIER_LOBO,
  SHIPPING_PROVIDER_CDEK,
  SHIPPING_PROVIDER_YANDEX_DELIVERY,
  SHIPPING_PROVIDER_YANDEX_EXPRESS,
} from "@molha/api-contract";

import { CHECKOUT_FORM_UI } from "../../../shared/config/appUiCopy.js";
import { resolveClientViewerRegionCode } from "../../../entities/region/lib/viewerRegion.js";
import { useAuthSession } from "../../../entities/user/model/useAuthSession.js";
import { AppIcon } from "../../../shared/ui/icon/index.js";

import "./CheckoutShippingProviderPicker.css";

const SERVICE_LABEL = {
  [SHIPPING_SERVICE_COURIER]: CHECKOUT_FORM_UI.SHIPPING_SERVICE_COURIER,
  [SHIPPING_SERVICE_PICKUP_POINT]: CHECKOUT_FORM_UI.SHIPPING_SERVICE_PICKUP_POINT,
};

const COURIER_OPTION_ID = "gitorg-courier";

/**
 * Плашка «кто везёт», когда выбирать нечего: иконка, мелкая подпись и имя
 * службы. Полная фраза — для экранных читалок и тестов.
 *
 * @param {{ id: string; label: string } | undefined} card
 */
function resolveSingleServiceBadge(card) {
  if (card?.id === COURIER_OPTION_ID) {
    return {
      icon: Bike,
      caption: CHECKOUT_FORM_UI.SHIPPING_PROVIDER_BADGE_CAPTION_PLURAL,
      name: CHECKOUT_FORM_UI.SHIPPING_PROVIDER_BADGE_COURIER,
      sentence: CHECKOUT_FORM_UI.SHIPPING_PROVIDER_SINGLE_COURIER,
    };
  }
  if (card?.id === CHECKOUT_SHIPPING_PROVIDER_SELLER) {
    return {
      icon: Store,
      caption: CHECKOUT_FORM_UI.SHIPPING_PROVIDER_BADGE_CAPTION,
      name: CHECKOUT_FORM_UI.SHIPPING_PROVIDER_BADGE_SELLER,
      sentence: CHECKOUT_FORM_UI.SHIPPING_PROVIDER_SINGLE_SELLER,
    };
  }
  const label = card?.label ?? "";
  return {
    icon: Truck,
    caption: CHECKOUT_FORM_UI.SHIPPING_PROVIDER_BADGE_CAPTION,
    name: label,
    sentence: CHECKOUT_FORM_UI.SHIPPING_PROVIDER_SINGLE(label),
  };
}

/**
 * Службы доставки в чекауте.
 *
 * Внутри «Доставки» покупатель выбирает службу из тех, что разрешил продавец:
 * его собственную доставку (или курьеров Gitorg), СДЭК или Яндекс Доставку —
 * те, по которым продавец подключил договор и включил тумблер. Остальные
 * перевозчики пока «скоро».
 *
 * @param {{
 *   disabled?: boolean;
 *   courierDelivery?: "courier" | "seller" | "mixed" | null;
 *   productCarrier?: string | null;
 *   cdekAvailable?: boolean;
 *   yandexAvailable?: boolean;
 *   expressAvailable?: boolean;
 *   sellerDeliveryAvailable?: boolean;
 *   selectedCarrier?: string | null;
 *   onSelectCarrier?: (carrier: string | null) => void;
 * }} props
 */
export function CheckoutShippingProviderPicker({
  disabled = false,
  courierDelivery = null,
  productCarrier = null,
  cdekAvailable = false,
  yandexAvailable = false,
  expressAvailable = false,
  sellerDeliveryAvailable = true,
  selectedCarrier = null,
  onSelectCarrier = null,
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

  // Локальную службу продавец задаёт на товаре: выбирать её покупателю не из
  // чего, но видеть, кто повезёт, он должен.
  const productCarrierFixed = productCarrier === PRODUCT_DELIVERY_CARRIER_LOBO;
  const isCourierSelected =
    !productCarrierFixed &&
    (courierDelivery === "courier" || courierDelivery === "mixed");
  const isSellerSelected =
    !productCarrierFixed &&
    (courierDelivery === "seller" || courierDelivery === "mixed");

  // Службы продавца, помимо его собственной доставки.
  const carrierCards = [
    cdekAvailable
      ? { id: SHIPPING_PROVIDER_CDEK, label: CHECKOUT_FORM_UI.SHIPPING_PROVIDER_CDEK }
      : null,
    yandexAvailable
      ? {
          id: SHIPPING_PROVIDER_YANDEX_DELIVERY,
          label: CHECKOUT_FORM_UI.SHIPPING_PROVIDER_YANDEX,
        }
      : null,
    expressAvailable
      ? {
          id: SHIPPING_PROVIDER_YANDEX_EXPRESS,
          label: CHECKOUT_FORM_UI.SHIPPING_PROVIDER_YANDEX_EXPRESS,
        }
      : null,
  ].filter(Boolean);
  const carrierIds = new Set(carrierCards.map((card) => card.id));
  const ownDeliverySelected = !selectedCarrier;
  // Переключаться есть смысл, только когда у продавца больше одной службы.
  const serviceCount = carrierCards.length + (sellerDeliveryAvailable ? 1 : 0);
  const canSwitch = serviceCount > 1 && typeof onSelectCarrier === "function";

  const cards = [
    {
      id: COURIER_OPTION_ID,
      label: CHECKOUT_FORM_UI.SHIPPING_PROVIDER_COURIER,
      selected: ownDeliverySelected && isCourierSelected,
      locked: false,
      selectable: canSwitch && isCourierSelected,
    },
    ...providerOptions
      // СДЭК и Яндекс решает продавец, а не общий список: ниже свои карточки.
      .filter(
        (option) =>
          option.id !== SHIPPING_PROVIDER_CDEK &&
          option.id !== SHIPPING_PROVIDER_YANDEX_DELIVERY,
      )
      .map((option) => {
        const isSeller = option.id === CHECKOUT_SHIPPING_PROVIDER_SELLER;
        const label = resolveCheckoutShippingProviderLabel(option.id, {
          sellerLabel: CHECKOUT_FORM_UI.SHIPPING_PROVIDER_SELLER,
        });
        const isFixedCarrier = productCarrierFixed && option.id === productCarrier;
        return {
          id: option.id,
          label,
          selected: isSeller ? ownDeliverySelected && isSellerSelected : isFixedCarrier,
          locked: !option.live,
          soon: !option.live,
          selectable: isSeller && canSwitch && isSellerSelected,
        };
      }),
    ...carrierCards.map((card) => ({
      ...card,
      selected: selectedCarrier === card.id,
      locked: false,
      selectable: canSwitch,
    })),
  ].sort((a, b) => Number(b.selected) - Number(a.selected));

  // Службу задаёт продавец на товаре. Переключать нечего — показываем строкой,
  // а не списком выключенных карточек: он выглядел как сломанный выбор.
  const selectedCards = cards.filter((card) => card.selected);
  const singleService = !canSwitch && selectedCards.length === 1;
  const singleBadge = resolveSingleServiceBadge(selectedCards[0]);

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

  if (singleService) {
    return (
      <div
        className="checkout-shipping-provider-picker__single"
        role="note"
        aria-label={singleBadge.sentence}
      >
        <span
          className="checkout-shipping-provider-picker__single-icon"
          aria-hidden="true"
        >
          <AppIcon icon={singleBadge.icon} size="md" strokeWidth={2.1} />
        </span>
        <span
          className="checkout-shipping-provider-picker__single-text"
          aria-hidden="true"
        >
          <span className="checkout-shipping-provider-picker__single-caption">
            {singleBadge.caption}
          </span>
          <span className="checkout-shipping-provider-picker__single-name">
            {singleBadge.name}
          </span>
        </span>
      </div>
    );
  }

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
            // Нажать можно — видно сразу; нельзя — карточка бледная и без рамки-акцента.
            !card.selected && card.selectable && !disabled
              ? "checkout-shipping-provider-picker__card--selectable"
              : "",
            !card.selected && !card.selectable
              ? "checkout-shipping-provider-picker__card--static"
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
              aria-disabled={!card.selectable || disabled}
              disabled={!card.selectable || disabled}
              onClick={() =>
                onSelectCarrier?.(carrierIds.has(card.id) ? card.id : null)
              }
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
