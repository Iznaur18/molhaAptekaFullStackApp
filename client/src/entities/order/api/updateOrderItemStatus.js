import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * `PATCH /order/:orderId/items/:itemIndex/delivered`
 *
 * @param {string} orderId
 * @param {number} itemIndex
 * @returns {Promise<import("../model/types.js").Order>}
 */
export async function markOrderItemDelivered(orderId, itemIndex) {
  try {
    const { data } = await apiClient.patch(
      `/order/${orderId}/items/${itemIndex}/delivered`,
    );

    if (!data?.success || !data.data?.order) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.order;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.UPDATE_ORDER_STATUS_FALLBACK;
    throw new Error(message);
  }
}

/**
 * `PATCH /order/:orderId/items/:itemIndex/cancelled`
 *
 * @param {string} orderId
 * @param {number} itemIndex
 * @returns {Promise<import("../model/types.js").Order>}
 */
export async function markOrderItemCancelled(orderId, itemIndex) {
  try {
    const { data } = await apiClient.patch(
      `/order/${orderId}/items/${itemIndex}/cancelled`,
    );

    if (!data?.success || !data.data?.order) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.order;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.UPDATE_ORDER_STATUS_FALLBACK;
    throw new Error(message);
  }
}

/**
 * `PATCH /order/:orderId/items/:itemIndex/returned`
 *
 * Товар уехал и вернулся: отказ у двери, неудачное вручение.
 *
 * @param {string} orderId
 * @param {number} itemIndex
 * @returns {Promise<import("../model/types.js").Order>}
 */
export async function markOrderItemReturned(orderId, itemIndex) {
  try {
    const { data } = await apiClient.patch(
      `/order/${orderId}/items/${itemIndex}/returned`,
    );

    if (!data?.success || !data.data?.order) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.order;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.UPDATE_ORDER_STATUS_FALLBACK;
    throw new Error(message);
  }
}

/**
 * `PATCH /order/:orderId/items/:itemIndex/shipped`
 *
 * @param {string} orderId
 * @param {number} itemIndex
 * @returns {Promise<import("../model/types.js").Order>}
 */
export async function markOrderItemShipped(orderId, itemIndex) {
  try {
    const { data } = await apiClient.patch(
      `/order/${orderId}/items/${itemIndex}/shipped`,
    );

    if (!data?.success || !data.data?.order) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.order;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.UPDATE_ORDER_STATUS_FALLBACK;
    throw new Error(message);
  }
}

/**
 * `PATCH /order/:orderId/shipment/status`
 *
 * Двигает отправление продавца на ступень целиком: «Принят» → «На сборке» →
 * «Готов». Позиции внутри не перечисляются — продавец собирает свой кусок
 * заказа, а не строку за строкой.
 *
 * @param {string} orderId
 * @param {string} nextStatus
 * @returns {Promise<import("../model/types.js").Order>}
 */
export async function advanceShipmentStatus(orderId, nextStatus) {
  try {
    const { data } = await apiClient.patch(`/order/${orderId}/shipment/status`, {
      nextStatus,
    });

    if (!data?.success || !data.data?.order) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.order;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.UPDATE_ORDER_STATUS_FALLBACK;
    throw new Error(message);
  }
}

/**
 * `PATCH /order/:orderId/items/:itemIndex/confirm`
 *
 * @param {string} orderId
 * @param {number} itemIndex
 * @returns {Promise<import("../model/types.js").ConfirmOrderItemResult>}
 */
export async function confirmOrderItem(orderId, itemIndex) {
  try {
    const { data } = await apiClient.patch(
      `/order/${orderId}/items/${itemIndex}/confirm`,
    );

    if (!data?.success || !data.data?.order) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    const pointsEarned = Number(data.data.pointsEarned);
    return {
      order: data.data.order,
      pointsEarned: Number.isFinite(pointsEarned) ? pointsEarned : 0,
    };
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.UPDATE_ORDER_STATUS_FALLBACK;
    throw new Error(message);
  }
}
