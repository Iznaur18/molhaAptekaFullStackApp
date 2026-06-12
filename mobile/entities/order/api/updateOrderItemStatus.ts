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
