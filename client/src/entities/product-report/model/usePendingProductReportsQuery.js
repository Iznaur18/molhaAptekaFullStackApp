import { useQuery } from "@tanstack/react-query";

import { fetchPendingProductReports } from "../api/fetchPendingProductReports.js";
import { productReportQueryKeys } from "./productReportQueryKeys.js";

/**
 * @param {{ enabled?: boolean }} [params]
 */
export function usePendingProductReportsQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: productReportQueryKeys.pending(),
    enabled,
    queryFn: fetchPendingProductReports,
  });
}
