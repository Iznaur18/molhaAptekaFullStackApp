import { apiClient } from "../../../shared/api/apiClient.js";

/**
 * Накладная СДЭК: продавец создаёт её ключом своего договора, а мы храним
 * номер отправления и статус в заказе.
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

/**
 * @param {{ orderId: string; shipmentPointCode?: string | null }} params
 */
export async function createCdekWaybill({ orderId, shipmentPointCode }) {
  try {
    const { data } = await apiClient.post(
      `/order/${encodeURIComponent(orderId)}/cdek-waybill`,
      shipmentPointCode ? { shipmentPointCode } : {},
    );
    return data?.data?.waybill ?? null;
  } catch (error) {
    return rethrow(error);
  }
}

/** @param {string} orderId */
export async function refreshCdekWaybill(orderId) {
  try {
    const { data } = await apiClient.get(
      `/order/${encodeURIComponent(orderId)}/cdek-waybill`,
    );
    return data?.data?.waybill ?? null;
  } catch (error) {
    return rethrow(error);
  }
}

/**
 * Пункты, где продавец может сдать посылку.
 *
 * @param {string} city
 */
export async function fetchCdekReceptionPoints(city) {
  try {
    const { data } = await apiClient.get("/order/cdek-reception-points", {
      params: { city },
    });
    return Array.isArray(data?.data?.points) ? data.data.points : [];
  } catch (error) {
    return rethrow(error);
  }
}

/**
 * PDF этикетки. Качаем через apiClient, чтобы ушли куки авторизации.
 *
 * @param {string} orderId
 * @returns {Promise<Blob>}
 */
export async function fetchCdekLabel(orderId) {
  try {
    const { data } = await apiClient.get(
      `/order/${encodeURIComponent(orderId)}/cdek-label`,
      { responseType: "blob" },
    );
    return data;
  } catch (error) {
    // Ошибка пришла blob'ом — достаём из него текст сервера.
    const blob = error?.response?.data;
    if (blob instanceof Blob) {
      let message = "";
      try {
        message = JSON.parse(await blob.text())?.message ?? "";
      } catch {
        /* ответ не JSON — покажем общий текст */
      }
      throw new Error(message || "СДЭК сейчас не отвечает");
    }
    return rethrow(error);
  }
}

/**
 * @param {{
 *   orderId: string;
 *   intakeDate: string;
 *   timeFrom: string;
 *   timeTo: string;
 *   phone: string;
 *   comment?: string;
 * }} params
 */
export async function createCdekIntake({ orderId, ...body }) {
  try {
    const { data } = await apiClient.post(
      `/order/${encodeURIComponent(orderId)}/cdek-intake`,
      body,
    );
    return data?.data?.waybill ?? null;
  } catch (error) {
    return rethrow(error);
  }
}
