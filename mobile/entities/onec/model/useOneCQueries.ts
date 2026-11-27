import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteOneCSettings,
  fetchOneCCategoryMappings,
  fetchOneCImportJobs,
  fetchOneCLogs,
  fetchOneCSettings,
  postOneCExchangeCredentials,
  postOneCSync,
  postOneCTest,
  putOneCCategoryMappings,
  putOneCSettings,
} from "@/entities/onec/api/onecApi";

export const onecQueryKeys = {
  settings: ["onec", "settings"] as const,
  logs: ["onec", "logs"] as const,
  mappings: ["onec", "category-mappings"] as const,
  importJobs: ["onec", "import-jobs"] as const,
};

export const useOneCSettingsQuery = (enabled = true) =>
  useQuery({
    queryKey: onecQueryKeys.settings,
    queryFn: fetchOneCSettings,
    enabled,
    staleTime: 30_000,
  });

export const useOneCLogsQuery = (enabled = true) =>
  useQuery({
    queryKey: onecQueryKeys.logs,
    queryFn: () => fetchOneCLogs({ limit: 30 }),
    enabled,
    staleTime: 15_000,
  });

export const useOneCCategoryMappingsQuery = (enabled = true) =>
  useQuery({
    queryKey: onecQueryKeys.mappings,
    queryFn: fetchOneCCategoryMappings,
    enabled,
    staleTime: 30_000,
  });

export const useOneCImportJobsQuery = (enabled = true) =>
  useQuery({
    queryKey: onecQueryKeys.importJobs,
    queryFn: () => fetchOneCImportJobs({ limit: 20 }),
    enabled,
    refetchInterval: (query) => {
      const jobs = query.state.data ?? [];
      const busy = jobs.some(
        (job) => job.status === "pending" || job.status === "processing",
      );
      return busy ? 3000 : false;
    },
  });

const useInvalidateOneC = () => {
  const queryClient = useQueryClient();
  return async () => {
    await queryClient.invalidateQueries({ queryKey: onecQueryKeys.settings });
    await queryClient.invalidateQueries({ queryKey: onecQueryKeys.logs });
  };
};

export const usePutOneCSettingsMutation = () => {
  const invalidate = useInvalidateOneC();
  return useMutation({
    mutationFn: putOneCSettings,
    onSuccess: () => void invalidate(),
  });
};

export const usePostOneCExchangeCredentialsMutation = () => {
  const invalidate = useInvalidateOneC();
  return useMutation({
    mutationFn: postOneCExchangeCredentials,
    onSuccess: () => void invalidate(),
  });
};

export const usePostOneCTestMutation = () => {
  const invalidate = useInvalidateOneC();
  return useMutation({
    mutationFn: postOneCTest,
    onSuccess: () => void invalidate(),
  });
};

export const usePostOneCSyncMutation = () => {
  const invalidate = useInvalidateOneC();
  return useMutation({
    mutationFn: postOneCSync,
    onSuccess: () => void invalidate(),
  });
};

export const useDeleteOneCSettingsMutation = () => {
  const invalidate = useInvalidateOneC();
  return useMutation({
    mutationFn: deleteOneCSettings,
    onSuccess: () => void invalidate(),
  });
};

export const usePutOneCCategoryMappingsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: putOneCCategoryMappings,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: onecQueryKeys.mappings });
    },
  });
};
