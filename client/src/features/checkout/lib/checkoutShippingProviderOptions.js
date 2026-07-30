import {
  SHIPPING_PROVIDER_LABEL_RU,
  SHIPPING_PROVIDERS,
  SHIPPING_SERVICE_COURIER,
  SHIPPING_SERVICE_PICKUP_POINT,
  SHIPPING_SERVICE_TYPES,
  isShippingProviderLive,
} from "@molha/api-contract";

/** Текущий живой путь: доставка продавцом (без API перевозчика). */
export const CHECKOUT_SHIPPING_PROVIDER_SELLER = "seller";

/**
 * @typedef {{
 *   id: string;
 *   live: boolean;
 * }} CheckoutShippingProviderOption
 */

/**
 * Опции служб для чекаута: продавец (live) + каркас перевозчиков.
 * @returns {CheckoutShippingProviderOption[]}
 */
export function listCheckoutShippingProviderOptions() {
  return [
    { id: CHECKOUT_SHIPPING_PROVIDER_SELLER, live: true },
    ...SHIPPING_PROVIDERS.map((id) => ({
      id,
      live: isShippingProviderLive(id),
    })),
  ];
}

/**
 * @param {string} providerId
 * @param {{ sellerLabel: string }} labels
 */
export function resolveCheckoutShippingProviderLabel(providerId, labels) {
  if (providerId === CHECKOUT_SHIPPING_PROVIDER_SELLER) {
    return labels.sellerLabel;
  }
  return SHIPPING_PROVIDER_LABEL_RU[providerId] ?? providerId;
}

export const CHECKOUT_SHIPPING_SERVICE_OPTIONS = [
  { id: SHIPPING_SERVICE_COURIER, live: false },
  { id: SHIPPING_SERVICE_PICKUP_POINT, live: false },
];

export { SHIPPING_SERVICE_TYPES, SHIPPING_SERVICE_COURIER, SHIPPING_SERVICE_PICKUP_POINT };
