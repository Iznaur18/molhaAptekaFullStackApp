import { apiClient } from "../../../shared/api/apiClient.js";

/**
 * СДЭК в оформлении заказа: доступность у продавца, пункты выдачи и тарифы.
 * Цена здесь — только для показа: при оформлении сервер пересчитает её сам.
 */

/**
 * @param {unknown} error
 * @returns {never}
 */
function rethrow(error) {
  const message =
    error?.response?.data?.message ?? error?.message ?? "СДЭК сейчас не отвечает";
  throw new Error(message);
}

/** @param {string} sellerId */
export async function fetchCdekAvailability(sellerId) {
  try {
    const { data } = await apiClient.get("/order/cdek-availability", {
      params: { sellerId },
    });
    return data?.data?.available === true;
  } catch {
    // Не смогли узнать — просто не показываем вариант, оформление не ломаем.
    return false;
  }
}

/**
 * @param {{ sellerId: string; city: string }} params
 * @returns {Promise<{ points: import('@molha/api-contract').CdekDeliveryPoint[]; cityCode: number | null }>}
 */
export async function fetchCdekDeliveryPoints({ sellerId, city }) {
  try {
    const { data } = await apiClient.get("/order/cdek-delivery-points", {
      params: { sellerId, city },
    });
    return {
      points: Array.isArray(data?.data?.points) ? data.data.points : [],
      cityCode: data?.data?.cityCode ?? null,
    };
  } catch (error) {
    return rethrow(error);
  }
}

/**
 * @param {{ productIds: string[]; toCityCode: number }} params
 */
export async function fetchCdekQuote({ productIds, toCityCode }) {
  try {
    const { data } = await apiClient.post("/order/cdek-quote", {
      productIds,
      toCityCode,
    });
    return data?.data ?? { available: false, options: [] };
  } catch (error) {
    return rethrow(error);
  }
}
