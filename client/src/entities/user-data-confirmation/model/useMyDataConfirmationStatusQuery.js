import { useQuery } from "@tanstack/react-query";

import { fetchMyDataConfirmationStatus } from "../api/fetchMyDataConfirmationStatus.js";
import { dataConfirmationStatusQueryKeys } from "./dataConfirmationStatusQueryKeys.js";

/**
 * @param {{ enabled: boolean }} params
 */
export function useMyDataConfirmationStatusQuery({ enabled }) {
  return useQuery({
    queryKey: dataConfirmationStatusQueryKeys.all,
    enabled,
    queryFn: fetchMyDataConfirmationStatus,
  });
}
