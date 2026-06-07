import { useMutation, useQueryClient } from "@tanstack/react-query";

import { resolveProductReports } from "../api/resolveProductReports.js";
import { invalidateProductReportQueries } from "../lib/productReportQueryCache.js";

export function useResolveProductReportsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, body }) => resolveProductReports(productId, body),
    onSuccess: () => {
      void invalidateProductReportQueries(queryClient);
    },
  });
}
