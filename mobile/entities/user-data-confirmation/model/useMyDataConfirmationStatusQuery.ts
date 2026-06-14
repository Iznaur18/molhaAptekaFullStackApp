import { useQuery } from "@tanstack/react-query";

import { dataConfirmationQueryKeys } from "@/shared/api";

import { fetchMyDataConfirmationStatus } from "../api/fetchMyDataConfirmationStatus";

export const useMyDataConfirmationStatusQuery = (enabled = true) =>
  useQuery({
    queryKey: dataConfirmationQueryKeys.myStatus(),
    queryFn: fetchMyDataConfirmationStatus,
    enabled,
  });
