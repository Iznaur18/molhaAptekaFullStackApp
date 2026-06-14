import { useQuery } from "@tanstack/react-query";

import { fetchAllOrdersAdmin } from "@/entities/order/api/fetchAllOrdersAdmin";
import { orderQueryKeys } from "@/shared/api";

export const useAdminOrdersQuery = (
  params: { page?: number; limit?: number; status?: string } = {},
  enabled = true,
) =>
  useQuery({
    queryKey: orderQueryKeys.adminAll(params),
    queryFn: () => fetchAllOrdersAdmin(params),
    enabled,
  });
