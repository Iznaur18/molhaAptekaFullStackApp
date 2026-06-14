import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type StaffProductPromotionRow = Record<string, unknown> & {
  _id: string;
  productId?: string;
  productName?: string | null;
  tariffTitle?: string;
  tier?: number;
  amountRub?: number;
  amountPoints?: number | null;
  paymentMethod?: string;
  seller?: { _id?: string; userName?: string | null } | null;
};

export const fetchPendingProductPromotions = async () => {
  try {
    const { data } = await apiClient.get("/product/promotions/pending");
    if (!data?.success || !Array.isArray(data.data?.promotions)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.promotions as StaffProductPromotionRow[];
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.FETCH_PRODUCT_PROMOTIONS_QUEUE_FALLBACK),
    );
  }
};

export const approveProductPromotion = async (promotionId: string) => {
  try {
    const { data } = await apiClient.patch(`/product/promotions/${promotionId}/approve`);
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.APPROVE_PRODUCT_PROMOTION_FALLBACK),
    );
  }
};

export const rejectProductPromotion = async (promotionId: string) => {
  try {
    const { data } = await apiClient.patch(`/product/promotions/${promotionId}/reject`);
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.REJECT_PRODUCT_PROMOTION_FALLBACK),
    );
  }
};
