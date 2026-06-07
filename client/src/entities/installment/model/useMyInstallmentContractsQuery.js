import { useQuery } from "@tanstack/react-query";

import { fetchMyInstallmentContracts } from "../api/installmentApi.js";
import { installmentQueryKeys } from "./installmentQueryKeys.js";

/**
 * @param {{ status?: string; enabled?: boolean }} params
 */
export function useMyInstallmentContractsQuery({ status = "", enabled = true }) {
  const params = status ? { status } : {};

  return useQuery({
    queryKey: installmentQueryKeys.myContracts(params),
    enabled,
    queryFn: () => fetchMyInstallmentContracts({ status }),
  });
}
