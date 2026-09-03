import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchMySellerSafeDeal,
  fetchSafeDealApplications,
  reviewSafeDealApplication,
  submitSellerSafeDealApplication,
} from "../api/sellerSafeDealApi.js";

export const sellerSafeDealQueryKeys = {
  me: () => ["seller-safe-deal", "me"],
  /** @param {string} status */
  queue: (status) => ["seller-safe-deal", "queue", status],
};

/** @param {{ enabled?: boolean }} [options] */
export function useMySellerSafeDealQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: sellerSafeDealQueryKeys.me(),
    queryFn: fetchMySellerSafeDeal,
    enabled,
    staleTime: 30_000,
  });
}

export function useSubmitSellerSafeDealMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitSellerSafeDealApplication,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sellerSafeDealQueryKeys.me() });
    },
  });
}

/** @param {{ status: string; enabled?: boolean }} params */
export function useSafeDealApplicationsQuery({ status, enabled = true }) {
  return useQuery({
    queryKey: sellerSafeDealQueryKeys.queue(status),
    queryFn: () => fetchSafeDealApplications({ status }),
    enabled,
    staleTime: 10_000,
  });
}

export function useReviewSafeDealApplicationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reviewSafeDealApplication,
    onSuccess: () => {
      // Решение переносит заявку между вкладками очереди — инвалидируем все.
      void queryClient.invalidateQueries({ queryKey: ["seller-safe-deal", "queue"] });
    },
  });
}
