import { sellerQrStatsDataSchema } from "@molha/api-contract";

import { apiClient } from "../../../shared/api/index.js";
import { parseApiContractData } from "../../../shared/api/parseApiContract.js";
import { SELLER_QR_UI } from "../../../shared/config/appUiCopy.js";

/**
 * `POST /analytics/track-seller-qr` — витрину открыли по QR-коду.
 * Учёт переходов не должен мешать смотреть витрину: сбой только в консоль.
 *
 * @param {{ sellerId: string; visitorId: string }} payload
 */
export async function trackSellerQrScan({ sellerId, visitorId }) {
  try {
    await apiClient.post("/analytics/track-seller-qr", { sellerId, visitorId });
  } catch (error) {
    console.warn("Seller QR scan was not tracked", error);
  }
}

/** `GET /analytics/seller-qr/me` — сколько раз открывали мою витрину по коду. */
export async function fetchMySellerQrStats() {
  try {
    const { data } = await apiClient.get("/analytics/seller-qr/me");
    return parseApiContractData(data, sellerQrStatsDataSchema);
  } catch (error) {
    throw new Error(error?.response?.data?.message ?? SELLER_QR_UI.STATS_FALLBACK);
  }
}
