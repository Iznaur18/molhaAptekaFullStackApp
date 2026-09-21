import { apiClient } from "../../../shared/api/apiClient.js";

/**
 * Заявка в Яндекс Доставку по заказу: создаёт её продавец своим токеном, мы
 * храним номер, статус и ссылку отслеживания.
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

const path = (orderId) =>
  `/order/${encodeURIComponent(orderId)}/yandex-delivery-request`;

/** @param {string} orderId */
export async function createYandexDeliveryRequest(orderId) {
  try {
    const { data } = await apiClient.post(path(orderId));
    return data?.data?.request ?? null;
  } catch (error) {
    return rethrow(error);
  }
}

/** @param {string} orderId */
export async function refreshYandexDeliveryRequest(orderId) {
  try {
    const { data } = await apiClient.get(path(orderId));
    return data?.data?.request ?? null;
  } catch (error) {
    return rethrow(error);
  }
}

/**
 * Ярлык PDF. Ошибка сервера приходит blob'ом — достаём из него текст.
 *
 * @param {string} orderId
 * @returns {Promise<Blob>}
 */
export async function fetchYandexDeliveryLabel(orderId) {
  try {
    const { data } = await apiClient.get(
      `/order/${encodeURIComponent(orderId)}/yandex-delivery-label`,
      { responseType: "blob" },
    );
    return data;
  } catch (error) {
    const blob = error?.response?.data;
    if (blob instanceof Blob) {
      let message = "";
      try {
        message = JSON.parse(await blob.text())?.message ?? "";
      } catch {
        /* ответ не JSON — покажем общий текст */
      }
      throw new Error(message || "Яндекс Доставка сейчас не отвечает");
    }
    return rethrow(error);
  }
}
