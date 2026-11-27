import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchMySellerCommerceDefaults,
  saveMySellerCommerceDefaults,
  type SaveSellerCommerceDefaultsPayload,
} from "@/entities/seller-commerce-defaults/api/sellerCommerceDefaultsApi";
import { catalogQueryKeys } from "@/shared/api";

export const sellerCommerceDefaultsQueryKeys = {
  me: () => ["seller-commerce-defaults", "me"] as const,
};

export const useMySellerCommerceDefaultsQuery = (enabled = true) =>
  useQuery({
    queryKey: sellerCommerceDefaultsQueryKeys.me(),
    queryFn: fetchMySellerCommerceDefaults,
    enabled,
    staleTime: 30_000,
  });

export const useSaveSellerCommerceDefaultsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveSellerCommerceDefaultsPayload) =>
      saveMySellerCommerceDefaults(payload),
    onSuccess: (defaults) => {
      queryClient.setQueryData(sellerCommerceDefaultsQueryKeys.me(), defaults);
      void queryClient.invalidateQueries({ queryKey: catalogQueryKeys.all });
    },
  });
};
