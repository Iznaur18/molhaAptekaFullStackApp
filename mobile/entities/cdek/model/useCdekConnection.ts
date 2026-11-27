import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchCdekConnection,
  removeCdekConnection,
  saveCdekConnection,
  toggleCdekConnection,
} from "@/entities/cdek/api/cdekCredentialsApi";

export const cdekConnectionQueryKeys = {
  mine: ["cdek", "connection", "me"] as const,
};

export const useMyCdekConnectionQuery = (enabled = true) =>
  useQuery({
    queryKey: cdekConnectionQueryKeys.mine,
    queryFn: fetchCdekConnection,
    enabled,
    staleTime: 60_000,
  });

export const useSaveCdekConnectionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveCdekConnection,
    onSuccess: (cdek) => {
      queryClient.setQueryData(cdekConnectionQueryKeys.mine, cdek);
    },
  });
};

export const useRemoveCdekConnectionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeCdekConnection,
    onSuccess: (cdek) => {
      queryClient.setQueryData(cdekConnectionQueryKeys.mine, cdek);
    },
  });
};

export const useToggleCdekConnectionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleCdekConnection,
    onSuccess: (cdek) => {
      queryClient.setQueryData(cdekConnectionQueryKeys.mine, cdek);
    },
  });
};
