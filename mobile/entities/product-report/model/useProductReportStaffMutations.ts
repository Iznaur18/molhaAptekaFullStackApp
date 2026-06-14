import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchPendingProductReports,
  resolveProductReports,
} from "@/entities/product-report/api/productReportStaffApi";
import { productReportQueryKeys } from "@/shared/api";

export const usePendingProductReportsQuery = (enabled = true) =>
  useQuery({
    queryKey: productReportQueryKeys.pending(),
    queryFn: fetchPendingProductReports,
    enabled,
  });

export const useResolveProductReportsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      body,
    }: {
      productId: string;
      body: { resolution: string; staffNote: string };
    }) => resolveProductReports(productId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productReportQueryKeys.all });
    },
  });
};
