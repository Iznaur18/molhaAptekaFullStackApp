import { ANALYTICS_CLIENT_EVENT_CHECKOUT_STARTED } from "@molha/api-contract";

import { apiClient } from "../../../shared/api/index.js";

/**
 * Покупатель открыл оформление заказа. Сервер учитывает одно событие в сутки.
 * Ошибки глушим: аналитика не должна мешать покупке.
 */
export async function trackCheckoutStarted() {
  try {
    await apiClient.post("/analytics/track", {
      kind: ANALYTICS_CLIENT_EVENT_CHECKOUT_STARTED,
      platform: "web",
    });
  } catch {
    // ignore
  }
}
