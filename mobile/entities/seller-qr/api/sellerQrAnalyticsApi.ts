import { sellerQrStatsDataSchema } from "@molha/api-contract";
import type { z } from "zod";

import { apiClient, parseApiContractData } from "@/shared/api";
import { SELLER_QR_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { reportClientIssue } from "@/shared/lib/reportClientIssue";

export type SellerQrStats = z.infer<typeof sellerQrStatsDataSchema>;

/**
 * `POST /analytics/track-seller-qr` — витрину открыли по QR-коду.
 * Учёт переходов не должен мешать смотреть витрину: сбой только в лог.
 */
export const trackSellerQrScan = async ({
  sellerId,
  visitorId,
}: {
  sellerId: string;
  visitorId: string;
}): Promise<void> => {
  try {
    await apiClient.post("/analytics/track-seller-qr", { sellerId, visitorId });
  } catch (error) {
    reportClientIssue("trackSellerQrScan", error);
  }
};

/** `GET /analytics/seller-qr/me` — сколько раз открывали мою витрину по коду. */
export const fetchMySellerQrStats = async (): Promise<SellerQrStats> => {
  try {
    const { data } = await apiClient.get("/analytics/seller-qr/me");
    return parseApiContractData(data, sellerQrStatsDataSchema);
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, SELLER_QR_UI.STATS_FALLBACK));
  }
};
