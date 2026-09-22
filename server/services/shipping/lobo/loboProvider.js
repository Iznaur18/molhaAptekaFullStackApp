import {
  SHIPPING_PROVIDER_LABEL_RU,
  SHIPPING_PROVIDER_LOBO,
  isShippingProviderLive,
} from "@molha/api-contract";

import { LOBO_NOT_CONFIGURED_MESSAGE } from "../../../constants/loboConstants.js";
import { AppError } from "../../../errors/AppError.js";

import {
  cancelLoboOrder,
  createLoboOrder,
  estimateLoboDelivery,
  getLoboOrder,
  isLoboConfigured,
} from "./loboClient.js";

/**
 * ЛОБО в общем реестре служб доставки.
 *
 * «Живая» здесь значит две вещи сразу: включена флагом в контракте и имеет
 * ключи в окружении. Без ключей служба существует, но ничего не умеет — и
 * предлагать её пользователю нельзя.
 */
export function createLoboShippingProvider() {
  const id = SHIPPING_PROVIDER_LOBO;
  const label = SHIPPING_PROVIDER_LABEL_RU[id] ?? id;

  const assertReady = () => {
    if (!isLoboConfigured()) {
      throw new AppError(503, LOBO_NOT_CONFIGURED_MESSAGE);
    }
  };

  return {
    id,
    label,
    isLive: () => isShippingProviderLive(id) && isLoboConfigured(),

    /** @param {Parameters<typeof estimateLoboDelivery>[0]} payload */
    quote: async (payload) => {
      assertReady();
      return estimateLoboDelivery(payload);
    },

    /** @param {Parameters<typeof createLoboOrder>[0]} payload */
    createShipment: async (payload) => {
      assertReady();
      return createLoboOrder(payload);
    },

    /** @param {{ carrierOrderId: string }} payload — id заказа в Wayset */
    getTracking: async (payload) => {
      assertReady();
      return getLoboOrder(String(payload?.carrierOrderId ?? ""));
    },

    /** @param {{ carrierOrderId: string }} payload — id заказа в Wayset */
    cancelShipment: async (payload) => {
      assertReady();
      return cancelLoboOrder(String(payload?.carrierOrderId ?? ""));
    },
  };
}
