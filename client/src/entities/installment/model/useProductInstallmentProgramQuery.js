import { useQuery } from "@tanstack/react-query";

import { fetchProductInstallmentProgram } from "../api/installmentApi.js";
import { installmentQueryKeys } from "./installmentQueryKeys.js";

/**
 * @param {{ productId: string; enabled?: boolean }} params
 */
export function useProductInstallmentProgramQuery({ productId, enabled = true }) {
  return useQuery({
    queryKey: installmentQueryKeys.program(productId),
    enabled: enabled && Boolean(productId),
    queryFn: () => fetchProductInstallmentProgram(productId),
  });
}
