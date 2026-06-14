import { useQuery } from "@tanstack/react-query";

import { installmentQueryKeys } from "@/shared/api";

import { fetchProductInstallmentProgram } from "../api/installmentApi";

export const useProductInstallmentProgramQuery = (productId: string, enabled = true) =>
  useQuery({
    queryKey: installmentQueryKeys.program(productId),
    queryFn: () => fetchProductInstallmentProgram(productId),
    enabled: Boolean(productId) && enabled,
  });
