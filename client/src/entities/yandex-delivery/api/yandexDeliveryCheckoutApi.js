import { apiClient } from "../../../shared/api/apiClient.js";

/**
 * Яндекс Доставка в оформлении заказа: доступность у продавца, пункты выдачи
 * и цена. Цена здесь только для показа — при оформлении сервер пересчитает.
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

/**
 * Что из Яндекса предлагает продавец: «в другой день» (пункты) и «Экспресс».
 *
 * @param {string} sellerId
 * @returns {Promise<{ available: boolean; expressAvailable: boolean }>}
 */
export async function fetchYandexDeliveryAvailability(sellerId) {
  try {
    const { data } = await apiClient.get("/order/yandex-delivery-availability", {
      params: { sellerId },
    });
    return {
      available: data?.data?.available === true,
      expressAvailable: data?.data?.expressAvailable === true,
    };
  } catch {
    // Не узнали — просто не показываем вариант, оформление не ломаем.
    return { available: false, expressAvailable: false };
  }
}

/** @param {{ sellerId: string; city: string }} params */
export async function fetchYandexDeliveryPoints({ sellerId, city }) {
  try {
    const { data } = await apiClient.get("/order/yandex-delivery-points", {
      params: { sellerId, city },
    });
    return Array.isArray(data?.data?.points) ? data.data.points : [];
  } catch (error) {
    return rethrow(error);
  }
}

/**
 * @param {{ items: Array<{ productId: string; quantity: number }>; pickupPointId: string }} params
 */
export async function fetchYandexDeliveryQuote({ items, pickupPointId }) {
  try {
    const { data } = await apiClient.post("/order/yandex-delivery-quote", {
      items,
      pickupPointId,
    });
    return data?.data ?? { available: false };
  } catch (error) {
    return rethrow(error);
  }
}

/**
 * Цена «Экспресса» до точки покупателя.
 *
 * @param {{ items: Array<{ productId: string; quantity: number }>; toLat: number; toLon: number }} params
 */
export async function fetchYandexExpressQuote({ items, toLat, toLon }) {
  try {
    const { data } = await apiClient.post("/order/yandex-express-quote", {
      items,
      toLat,
      toLon,
    });
    return data?.data ?? { available: false };
  } catch (error) {
    return rethrow(error);
  }
}
