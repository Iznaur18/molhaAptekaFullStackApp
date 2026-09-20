import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchCdekConnection,
  removeCdekConnection,
  saveCdekConnection,
} from "../api/cdekCredentialsApi.js";

export const cdekConnectionQueryKeys = {
  mine: ["cdek", "connection", "me"],
};

/**
 * @param {{ enabled?: boolean }} [params]
 */
export function useMyCdekConnectionQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: cdekConnectionQueryKeys.mine,
    queryFn: fetchCdekConnection,
    enabled,
    staleTime: 60_000,
  });
}

export function useSaveCdekConnectionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveCdekConnection,
    onSuccess: (cdek) => {
      // Ответ уже содержит новое состояние — лишний запрос не нужен.
      queryClient.setQueryData(cdekConnectionQueryKeys.mine, cdek);
    },
  });
}

export function useRemoveCdekConnectionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeCdekConnection,
    onSuccess: (cdek) => {
      queryClient.setQueryData(cdekConnectionQueryKeys.mine, cdek);
    },
  });
}
