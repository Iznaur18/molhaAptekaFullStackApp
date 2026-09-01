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
 * Опции служб для чекаута: продавец и все перевозчики.
 *
 * Неподключённые показываем с пометкой «скоро», а не прячем: покупатель
 * должен видеть, куда движется сервис, и не гадать, есть ли вообще СДЭК.
 * Так же они выглядят и у продавца в карточке товара.
 *
 * @returns {CheckoutShippingProviderOption[]}
 */
export function listCheckoutShippingProviderOptions() {
  return [
    { id: CHECKOUT_SHIPPING_PROVIDER_SELLER, live: true },
    ...SHIPPING_PROVIDERS.map((id) => ({ id, live: isShippingProviderLive(id) })),
  ];
}

/**
 * Есть ли хотя бы один live-перевозчик (не «Продавцом»).
 * Типы «Курьер» / «ПВЗ» показываем только тогда.
 */
export function hasCheckoutLiveCarrierProviders() {
  return listCheckoutShippingProviderOptions().some(
    (option) => option.id !== CHECKOUT_SHIPPING_PROVIDER_SELLER && option.live,
  );
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

/** @type {ReadonlyArray<{ id: string; live: boolean }>} */
export const CHECKOUT_SHIPPING_SERVICE_OPTIONS = [
  { id: SHIPPING_SERVICE_COURIER, live: false },
  { id: SHIPPING_SERVICE_PICKUP_POINT, live: false },
];

/**
 * Только live типы выдачи (курьер / ПВЗ).
 * @returns {Array<{ id: string; live: boolean }>}
 */
export function listCheckoutShippingServiceOptions() {
  return CHECKOUT_SHIPPING_SERVICE_OPTIONS.filter((option) => option.live);
}

export { SHIPPING_SERVICE_TYPES, SHIPPING_SERVICE_COURIER, SHIPPING_SERVICE_PICKUP_POINT };
