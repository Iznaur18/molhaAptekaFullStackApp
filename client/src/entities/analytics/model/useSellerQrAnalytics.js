import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { SELLER_QR_SOURCE_PARAM, SELLER_QR_SOURCE_VALUE } from "@molha/api-contract";

import {
  fetchMySellerQrStats,
  trackSellerQrScan,
} from "../api/sellerQrAnalyticsApi.js";
import { getSellerQrVisitorId, markSellerQrScanToday } from "../lib/sellerQrVisitor.js";

export const sellerQrAnalyticsKeys = {
  myStats: () => ["seller-qr", "my-stats"],
};

/** Сколько раз открывали мою витрину по QR-коду. */
export function useMySellerQrStatsQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: sellerQrAnalyticsKeys.myStats(),
    queryFn: fetchMySellerQrStats,
    enabled,
    staleTime: 60_000,
  });
}

/**
 * На витрине: если пришли по QR-коду (`?src=qr`), один раз в день сообщаем об
 * этом серверу. Сам продавец на своей витрине не считается.
 *
 * @param {{ sellerId: string; isSelf: boolean; enabled?: boolean }} params
 */
export function useTrackSellerQrScan({ sellerId, isSelf, enabled = true }) {
  const [searchParams] = useSearchParams();
  const cameFromQr =
    searchParams.get(SELLER_QR_SOURCE_PARAM) === SELLER_QR_SOURCE_VALUE;

  useEffect(() => {
    if (!enabled || !cameFromQr || isSelf || !sellerId) {
      return;
    }
    if (!markSellerQrScanToday(sellerId)) {
      return;
    }
    void trackSellerQrScan({ sellerId, visitorId: getSellerQrVisitorId() });
  }, [cameFromQr, enabled, isSelf, sellerId]);
}
