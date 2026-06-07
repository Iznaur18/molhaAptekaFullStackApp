import { useQuery } from "@tanstack/react-query";

import { fetchMyProductReportStatus } from "../api/fetchMyProductReportStatus.js";
import { productReportQueryKeys } from "./productReportQueryKeys.js";

/**
 * @param {{ productId: string | null | undefined; enabled?: boolean }} params
 */
export function useMyProductReportStatusQuery({ productId, enabled = true }) {
  const id = productId != null ? String(productId) : "";

  return useQuery({
    queryKey: productReportQueryKeys.myStatus(id),
    enabled: enabled && Boolean(id),
    queryFn: () => fetchMyProductReportStatus(id),
  });
}
