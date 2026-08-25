import { useQuery } from "@tanstack/react-query";

import { fetchComparableProducts } from "@/entities/product/api/fetchComparableProducts";
import { catalogQueryKeys } from "@/shared/api";

type UseComparableProductsQueryParams = {
  productId: string | null | undefined;
  enabled?: boolean;
};

/** Порт `client/src/entities/product/model/useComparableProductsQuery.js`. */
export const useComparableProductsQuery = ({
  productId,
  enabled = true,
}: UseComparableProductsQueryParams) => {
  const id = productId != null ? String(productId).trim() : "";

  return useQuery({
    queryKey: [...catalogQueryKeys.all, "compare", id],
    enabled: enabled && id.length > 0,
    queryFn: () => fetchComparableProducts(id),
    staleTime: 60_000,
  });
};
