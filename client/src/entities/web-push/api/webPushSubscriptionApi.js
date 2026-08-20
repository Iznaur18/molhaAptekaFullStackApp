import { formatApiErrorMessage } from "@izibuy/shared-lib";

import { apiClient } from "../../../shared/api/apiClient.js";

export async function fetchWebPushVapidPublicKey() {
  try {
    const { data } = await apiClient.get("/auth/me/web-push/vapid-public-key");
    const publicKey = data?.data?.publicKey;
    if (!data?.success || typeof publicKey !== "string" || !publicKey.trim()) {
      throw new Error("VAPID public key отсутствует");
    }
    return publicKey.trim();
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось получить ключ push"));
  }
}

/**
 * @param {PushSubscriptionJSON} subscription
 */
export async function registerWebPushSubscription(subscription) {
  try {
    const { data } = await apiClient.put("/auth/me/web-push-subscription", subscription);
    if (!data?.success) {
      throw new Error("Не удалось включить push-уведомления");
    }
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось включить push-уведомления"));
  }
}

/**
 * @param {string} endpoint
 */
export async function removeWebPushSubscription(endpoint) {
  try {
    await apiClient.delete("/auth/me/web-push-subscription", {
      data: { endpoint },
    });
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось отключить push-уведомления"));
  }
}
