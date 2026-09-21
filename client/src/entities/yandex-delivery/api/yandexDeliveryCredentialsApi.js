import { apiClient } from "../../../shared/api/apiClient.js";

/**
 * Подключение Яндекс Доставки у продавца. Токен уходит на сервер и обратно
 * не возвращается — только признак «подключено» и его хвост.
 */

const PATH = "/user/me/yandex-delivery-credentials";

/**
 * @param {unknown} error
 * @returns {never}
 */
function rethrow(error) {
  const message =
    error?.response?.data?.message ??
    error?.message ??
    "Не удалось связаться с Яндекс Доставкой";
  throw new Error(message);
}

export async function fetchYandexDeliveryConnection() {
  try {
    const { data } = await apiClient.get(PATH);
    return data?.data?.yandexDelivery ?? null;
  } catch (error) {
    return rethrow(error);
  }
}

/** @param {{ token: string; environment?: "prod" | "test" }} payload */
export async function saveYandexDeliveryConnection(payload) {
  try {
    const { data } = await apiClient.put(PATH, payload);
    return data?.data?.yandexDelivery ?? null;
  } catch (error) {
    return rethrow(error);
  }
}

export async function removeYandexDeliveryConnection() {
  try {
    const { data } = await apiClient.delete(PATH);
    return data?.data?.yandexDelivery ?? null;
  } catch (error) {
    return rethrow(error);
  }
}

/** @param {boolean} enabled */
export async function toggleYandexDeliveryConnection(enabled) {
  try {
    const { data } = await apiClient.patch(PATH, { enabled });
    return data?.data?.yandexDelivery ?? null;
  } catch (error) {
    return rethrow(error);
  }
}
