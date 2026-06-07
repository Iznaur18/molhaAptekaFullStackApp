import { useQuery } from "@tanstack/react-query";

import { fetchMyInstallmentSales } from "../api/installmentApi.js";
import { installmentQueryKeys } from "./installmentQueryKeys.js";

/**
 * @param {{ status?: string; enabled?: boolean }} params
 */
export function useMyInstallmentSalesQuery({ status = "", enabled = true }) {
  const params = status ? { status } : {};

  return useQuery({
    queryKey: installmentQueryKeys.mySales(params),
    enabled,
    queryFn: () => fetchMyInstallmentSales({ status }),
  });
}
