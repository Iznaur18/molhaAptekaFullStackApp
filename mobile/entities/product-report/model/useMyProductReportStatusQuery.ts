import { useQuery } from "@tanstack/react-query";

import { fetchMyProductReportStatus } from "@/entities/product-report/api/fetchMyProductReportStatus";
import { productReportQueryKeys } from "@/shared/api";

type UseMyProductReportStatusQueryOptions = {
  productId: string;
  enabled?: boolean;
};

export const useMyProductReportStatusQuery = ({
  productId,
  enabled = true,
}: UseMyProductReportStatusQueryOptions) =>
  useQuery({
    queryKey: productReportQueryKeys.myStatus(productId),
    queryFn: () => fetchMyProductReportStatus(productId),
    enabled: enabled && productId.length > 0,
  });
