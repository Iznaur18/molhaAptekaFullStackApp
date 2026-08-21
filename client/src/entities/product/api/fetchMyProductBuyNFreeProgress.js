import { formatApiErrorMessage } from "@izibuy/shared-lib";

import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @typedef {{
 *   enabled: boolean;
 *   threshold: number | null;
 *   completedPaidOrderCount: number;
 *   freeEligible: boolean;
 *   freeClaimPending: boolean;
 * }} BuyNFreeProgress
 */

/**
 * `GET /product/:productId/buy-n-free/me`
 *
 * @param {string} productId
 * @returns {Promise<BuyNFreeProgress>}
 */
export async function fetchMyProductBuyNFreeProgress(productId) {
  const id = String(productId ?? "").trim();
  if (!id) {
    throw new Error(API_CLIENT_UI.FETCH_CATALOG_PRODUCT_FALLBACK);
  }
  try {
    const { data } = await apiClient.get(`/product/${encodeURIComponent(id)}/buy-n-free/me`);
    if (data?.success !== true || data?.data == null || typeof data.data !== "object") {
      throw new Error(API_CLIENT_UI.FETCH_CATALOG_PRODUCT_FALLBACK);
    }
    const row = data.data;
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
