import {
  apiClient,
  parseConfirmOrderItemData,
  parseUpdateOrderItemData,
} from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

const FALLBACK = API_CLIENT_UI.UPDATE_ORDER_STATUS_FALLBACK;

export const confirmOrderItem = async (orderId: string, itemIndex: number) => {
  try {
    const { data } = await apiClient.patch(
      `/order/${orderId}/items/${itemIndex}/confirm`,
    );
    const parsed = parseConfirmOrderItemData(data);
    const pointsEarned = Number(parsed.pointsEarned);
    return {
      order: parsed.order,
      pointsEarned: Number.isFinite(pointsEarned) ? pointsEarned : 0,
    };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, FALLBACK));
  }
};

export const markOrderItemCancelled = async (orderId: string, itemIndex: number) => {
  try {
    const { data } = await apiClient.patch(
      `/order/${orderId}/items/${itemIndex}/cancelled`,
    );
    return parseUpdateOrderItemData(data);
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, FALLBACK));
  }
};

/**
 * `PATCH /order/:orderId/items/:itemIndex/returned` — товар уехал и вернулся:
 * отказ у двери, неудачное вручение.
 */
export const markOrderItemReturned = async (orderId: string, itemIndex: number) => {
  try {
    const { data } = await apiClient.patch(
      `/order/${orderId}/items/${itemIndex}/returned`,
    );
    return parseUpdateOrderItemData(data);
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, FALLBACK));
  }
};

/**
 * `PATCH /order/:orderId/shipment/:sellerId/cancelled` — снимает заказ
 * продавца целиком, а не построчно (у покупателя и у продавца).
 */
export const cancelOrderShipment = async (orderId: string, sellerId: string) => {
  try {
    const { data } = await apiClient.patch(
      `/order/${orderId}/shipment/${sellerId}/cancelled`,
    );
    return parseUpdateOrderItemData(data);
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, FALLBACK));
  }
};

export const markOrderItemShipped = async (orderId: string, itemIndex: number) => {
  try {
    const { data } = await apiClient.patch(
      `/order/${orderId}/items/${itemIndex}/shipped`,
    );
    return parseUpdateOrderItemData(data);
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, FALLBACK));
  }
};

/**
 * `PATCH /order/:orderId/shipment/status` — продавец двигает своё отправление
 * на ступень целиком: «Принят» → «На сборке» → «Готов».
 */
export const advanceShipmentStatus = async (orderId: string, nextStatus: string) => {
  try {
    const { data } = await apiClient.patch(`/order/${orderId}/shipment/status`, {
      nextStatus,
    });
    return parseUpdateOrderItemData(data);
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, FALLBACK));
  }
};

export const markOrderItemDelivered = async (orderId: string, itemIndex: number) => {
  try {
    const { data } = await apiClient.patch(
      `/order/${orderId}/items/${itemIndex}/delivered`,
    );
    return parseUpdateOrderItemData(data);
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, FALLBACK));
  }
};
