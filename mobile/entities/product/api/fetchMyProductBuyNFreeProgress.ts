import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type BuyNFreeProgress = {
  enabled: boolean;
  threshold: number | null;
  completedPaidOrderCount: number;
  freeEligible: boolean;
  freeClaimPending: boolean;
};

/** `GET /product/:productId/buy-n-free/me` */
export async function fetchMyProductBuyNFreeProgress(
  productId: string,
): Promise<BuyNFreeProgress> {
  const id = String(productId ?? "").trim();
  if (!id) {
    throw new Error(API_CLIENT_UI.FETCH_CATALOG_PRODUCT_FALLBACK);
  }
  try {
    const { data } = await apiClient.get(
      `/product/${encodeURIComponent(id)}/buy-n-free/me`,
    );
    if (data?.success !== true || data?.data == null || typeof data.data !== "object") {
      throw new Error(API_CLIENT_UI.FETCH_CATALOG_PRODUCT_FALLBACK);
    }
    const row = data.data as Record<string, unknown>;
    return {
      enabled: row.enabled === true,
      threshold:
        row.threshold == null ? null : Math.floor(Number(row.threshold)) || null,
      completedPaidOrderCount: Math.max(
        0,
        Math.floor(Number(row.completedPaidOrderCount) || 0),
      ),
      freeEligible: row.freeEligible === true,
      freeClaimPending: row.freeClaimPending === true,
    };
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.FETCH_CATALOG_PRODUCT_FALLBACK),
    );
  }
}
