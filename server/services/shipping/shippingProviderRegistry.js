import {
  SHIPPING_NOT_AVAILABLE_MESSAGE,
  SHIPPING_PROVIDER_LABEL_RU,
  SHIPPING_PROVIDER_LOBO,
  SHIPPING_PROVIDERS,
  isShippingProviderLive,
} from "@molha/api-contract";

import { AppError } from "../../errors/AppError.js";

import { createLoboShippingProvider } from "./lobo/loboProvider.js";

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

// ЛОБО — единственная служба с живым API; остальные пока заглушки.
const registry = new Map(
  SHIPPING_PROVIDERS.map((id) => [
    id,
    id === SHIPPING_PROVIDER_LOBO
      ? createLoboShippingProvider()
      : createStubShippingProvider({ id }),
  ]),
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
 * Вызов метода службы. У заглушек любой метод отвечает 501.
 *
 * @param {string} providerId
 * @param {"quote" | "createShipment" | "getTracking" | "cancelShipment"} method
 * @param {unknown} [payload]
 */
export async function invokeShippingProvider(providerId, method, payload) {
  const provider = getShippingProvider(providerId);
  const handler = provider[method];
  if (typeof handler !== "function") {
    throw new AppError(400, `Неизвестный метод провайдера: ${method}`);
  }
  return handler(payload);
}
