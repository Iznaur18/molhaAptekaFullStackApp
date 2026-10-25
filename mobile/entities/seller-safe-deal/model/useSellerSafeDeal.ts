import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { sellerSafeDealQueryKeys } from "@/shared/api";

import {
  fetchMySellerSafeDeal,
  submitSellerSafeDealApplication,
} from "../api/sellerSafeDealApi";

export const useMySellerSafeDealQuery = ({
  enabled = true,
}: { enabled?: boolean } = {}) =>
  useQuery({
    queryKey: sellerSafeDealQueryKeys.me(),
    queryFn: fetchMySellerSafeDeal,
    enabled,
    staleTime: 30_000,
  });

export const useSubmitSellerSafeDealMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitSellerSafeDealApplication,
    onSuccess: (safeDeal) => {
      queryClient.setQueryData(sellerSafeDealQueryKeys.me(), safeDeal);
      void queryClient.invalidateQueries({ queryKey: sellerSafeDealQueryKeys.me() });
    },
  });
};
