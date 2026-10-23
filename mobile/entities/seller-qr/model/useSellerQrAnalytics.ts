import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { fetchMySellerQrStats, trackSellerQrScan } from "../api/sellerQrAnalyticsApi";
import {
  getSellerQrVisitorId,
  markSellerQrScanToday,
} from "../lib/sellerQrVisitorStorage";

export const sellerQrQueryKeys = {
  myStats: () => ["seller-qr", "my-stats"] as const,
};

/** Сколько раз открывали мою витрину по QR-коду. */
export const useMySellerQrStatsQuery = ({
  enabled = true,
}: { enabled?: boolean } = {}) =>
  useQuery({
    queryKey: sellerQrQueryKeys.myStats(),
    queryFn: fetchMySellerQrStats,
    enabled,
    staleTime: 60_000,
  });

/**
 * Витрину открыли по QR-коду (`?src=qr`, приложение перехватило ссылку
 * gitorg.ru) — раз в день сообщаем серверу, как web `useTrackSellerQrScan`.
 * Сам продавец на своей витрине не считается.
 */
export const useTrackSellerQrScan = ({
  sellerId,
  isSelf,
  cameFromQr,
  enabled = true,
}: {
  sellerId: string;
  isSelf: boolean;
  cameFromQr: boolean;
  enabled?: boolean;
}) => {
  useEffect(() => {
    if (!enabled || !cameFromQr || isSelf || !sellerId) {
      return;
    }
    let cancelled = false;
    void (async () => {
      if (!(await markSellerQrScanToday(sellerId)) || cancelled) {
        return;
      }
      await trackSellerQrScan({ sellerId, visitorId: await getSellerQrVisitorId() });
    })();
    return () => {
      cancelled = true;
    };
  }, [cameFromQr, enabled, isSelf, sellerId]);
};
