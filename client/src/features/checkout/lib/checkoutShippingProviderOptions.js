import {
  SHIPPING_PROVIDER_LABEL_RU,
  SHIPPING_PROVIDERS,
  SHIPPING_SERVICE_COURIER,
  SHIPPING_SERVICE_PICKUP_POINT,
  SHIPPING_SERVICE_TYPES,
  isShippingProviderAvailableInRegion,
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
 * Опции служб для чекаута: продавец и перевозчики.
 *
 * Неподключённые показываем с пометкой «скоро», а не прячем: покупатель
 * должен видеть, куда движется сервис, и не гадать, есть ли вообще СДЭК.
 *
 * А вот службу, которой в этом регионе нет, не показываем вовсе — обещать
 * ЛОБО жителю Москвы хуже, чем промолчать.
 *
 * @param {{ regionCode?: string | null }} [options]
 * @returns {CheckoutShippingProviderOption[]}
 */
export function listCheckoutShippingProviderOptions({ regionCode = null } = {}) {
  return [
    { id: CHECKOUT_SHIPPING_PROVIDER_SELLER, live: true },
    ...SHIPPING_PROVIDERS.filter((id) =>
      // Ограничение по региону есть только у локальных служб; у остальных
      // помощник всегда возвращает true.
      isShippingProviderAvailableInRegion(id, regionCode),
    ).map((id) => ({ id, live: isShippingProviderLive(id) })),
  ];
}

/**
 * Есть ли хотя бы один live-перевозчик (не «Продавцом»).
 * Типы «Курьер» / «ПВЗ» показываем только тогда.
 */
export function hasCheckoutLiveCarrierProviders(regionCode = null) {
  return listCheckoutShippingProviderOptions({ regionCode }).some(
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
