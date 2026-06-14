import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type ProductPromotionTier = {
  tier: number;
  title: string;
  description: string;
};

export type ProductPromotionDuration = {
  code: string;
  title: string;
  durationHours: number;
  durationMult: number;
};

export type ProductPromotionTariffs = {
  tiers: ProductPromotionTier[];
  durations: ProductPromotionDuration[];
};

export const fetchProductPromotionTariffs = async (): Promise<ProductPromotionTariffs> => {
  try {
    const { data } = await apiClient.get("/product/promotions/tariffs");
    if (
      !data?.success ||
      !Array.isArray(data.data?.tiers) ||
      !Array.isArray(data.data?.durations)
    ) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return {
      tiers: data.data.tiers as ProductPromotionTier[],
      durations: data.data.durations as ProductPromotionDuration[],
    };
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.FETCH_PRODUCT_PROMOTION_TARIFFS_FALLBACK),
    );
  }
};
