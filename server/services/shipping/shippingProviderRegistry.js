import {
  SHIPPING_NOT_AVAILABLE_MESSAGE,
  SHIPPING_PROVIDER_LABEL_RU,
  SHIPPING_PROVIDERS,
  isShippingProviderLive,
} from "@molha/api-contract";

import { AppError } from "../../errors/AppError.js";

/**
 * @param {{ id: string }} params
 */
export function createStubShippingProvider({ id }) {
  const label = SHIPPING_PROVIDER_LABEL_RU[id] ?? id;

  const notAvailable = () => {
    throw new AppError(501, `${SHIPPING_NOT_AVAILABLE_MESSAGE} (${label})`);
  };

  return {
    id,
    label,
    isLive: () => isShippingProviderLive(id),
    /** @returns {Promise<never>} */
    quote: async () => notAvailable(),
    /** @returns {Promise<never>} */
    createShipment: async () => notAvailable(),
    /** @returns {Promise<never>} */
    getTracking: async () => notAvailable(),
  };
}

const registry = new Map(
  SHIPPING_PROVIDERS.map((id) => [id, createStubShippingProvider({ id })]),
);

/**
 * @param {string} providerId
 */
export function getShippingProvider(providerId) {
  const provider = registry.get(providerId);
  if (!provider) {
    throw new AppError(400, `Неизвестный провайдер доставки: ${providerId}`);
  }
  return provider;
}

export function listShippingProviders() {
  return SHIPPING_PROVIDERS.map((id) => registry.get(id));
}

/**
 * Live-вызовы пока всегда 501; заказ создавать можно без этого.
 * @param {string} providerId
 * @param {"quote" | "createShipment" | "getTracking"} method
 * @param {unknown} [payload]
 */
export async function invokeShippingProvider(providerId, method, payload) {
  const provider = getShippingProvider(providerId);
  if (method === "quote") {
    return provider.quote(payload);
  }
  if (method === "createShipment") {
    return provider.createShipment(payload);
  }
  if (method === "getTracking") {
    return provider.getTracking(payload);
  }
  throw new AppError(400, `Неизвестный метод провайдера: ${method}`);
}
