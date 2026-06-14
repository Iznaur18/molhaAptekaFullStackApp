import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type ModerationProduct = Record<string, unknown> & {
  _id: string;
  productName?: string;
  productSeller?: string | { _id?: string; userName?: string } | null;
  createdAt?: string;
};

export const fetchPendingModerationProducts = async (limit = 100) => {
  try {
    const { data } = await apiClient.get("/product/moderation/pending", {
      params: { page: 1, limit },
    });
    if (!data?.success || !Array.isArray(data.data?.products)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.products as ModerationProduct[];
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.FETCH_MODERATION_QUEUE_FALLBACK),
    );
  }
};

export const approveProductModeration = async (productId: string) => {
  try {
    const { data } = await apiClient.patch(`/product/${productId}/moderation/approve`);
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data?.product as ModerationProduct;
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.APPROVE_PRODUCT_MODERATION_FALLBACK),
    );
  }
};

export const rejectProductModeration = async (productId: string, comment = "") => {
  try {
    const { data } = await apiClient.patch(`/product/${productId}/moderation/reject`, {
      comment: comment.trim() || undefined,
    });
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data?.product as ModerationProduct;
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.REJECT_PRODUCT_MODERATION_FALLBACK),
    );
  }
};
