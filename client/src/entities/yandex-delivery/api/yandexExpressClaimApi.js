import { apiClient } from "../../../shared/api/apiClient.js";

/**
 * Курьер «Экспресс» по заказу: вызывает продавец кнопкой, заявку ведёт
 * Яндекс по договору продавца.
 */

/**
 * @param {unknown} error
 * @returns {never}
 */
function rethrow(error) {
  const message =
    error?.response?.data?.message ??
    error?.message ??
    "Яндекс Доставка сейчас не отвечает";
  throw new Error(message);
}

/** @param {string} orderId */
const path = (orderId) =>
  "/order/" + encodeURIComponent(orderId) + "/yandex-express-claim";

/** @param {string} orderId */
export async function createYandexExpressClaim(orderId) {
  try {
    const { data } = await apiClient.post(path(orderId));
    return data?.data?.claim ?? null;
  } catch (error) {
    return rethrow(error);
  }
}

/** @param {string} orderId */
export async function refreshYandexExpressClaim(orderId) {
  try {
    const { data } = await apiClient.get(path(orderId));
    return data?.data?.claim ?? null;
  } catch (error) {
    return rethrow(error);
  }
}

/** @param {{ enabled: boolean; phone?: string }} payload */
export async function saveYandexExpressSettings(payload) {
  try {
    const { data } = await apiClient.patch("/user/me/yandex-express", payload);
    return data?.data?.express ?? null;
  } catch (error) {
    return rethrow(error);
  }
}
