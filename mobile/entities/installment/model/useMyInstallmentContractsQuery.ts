import { useQuery } from "@tanstack/react-query";

import { installmentQueryKeys } from "@/shared/api";

import { fetchMyInstallmentContracts } from "../api/installmentApi";

export const useMyInstallmentContractsQuery = ({
  status = "",
  enabled = true,
}: {
  status?: string;
  enabled?: boolean;
} = {}) =>
  useQuery({
    queryKey: installmentQueryKeys.myContracts(status),
    queryFn: () => fetchMyInstallmentContracts(status || undefined),
    enabled,
  });
