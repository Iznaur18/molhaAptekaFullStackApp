import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchCourierApplications,
  fetchMyCourierProfile,
  reviewCourierApplication,
  submitCourierApplication,
} from "../api/courierApi.js";

export const courierQueryKeys = {
  me: () => ["courier", "me"],
  /** @param {string} status */
  queue: (status) => ["courier", "queue", status],
};

/** @param {{ enabled?: boolean }} [options] */
export function useMyCourierProfileQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: courierQueryKeys.me(),
    queryFn: fetchMyCourierProfile,
    enabled,
    staleTime: 30_000,
  });
}

export function useSubmitCourierApplicationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitCourierApplication,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: courierQueryKeys.me() });
    },
  });
}

/** @param {{ status: string; enabled?: boolean }} params */
export function useCourierApplicationsQuery({ status, enabled = true }) {
  return useQuery({
    queryKey: courierQueryKeys.queue(status),
    queryFn: () => fetchCourierApplications({ status }),
    enabled,
    staleTime: 10_000,
  });
}

export function useReviewCourierApplicationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reviewCourierApplication,
    onSuccess: () => {
      // Решение переносит заявку между вкладками очереди — инвалидируем все.
      void queryClient.invalidateQueries({ queryKey: ["courier", "queue"] });
    },
  });
}
