import { useQuery } from "@tanstack/react-query";

import { installmentQueryKeys } from "@/shared/api";

import { fetchMyInstallmentSales } from "../api/installmentApi";

export const useMyInstallmentSalesQuery = ({
  status = "",
  enabled = true,
}: {
  status?: string;
  enabled?: boolean;
} = {}) =>
  useQuery({
    queryKey: installmentQueryKeys.mySales(status),
    queryFn: () => fetchMyInstallmentSales(status || undefined),
    enabled,
  });
