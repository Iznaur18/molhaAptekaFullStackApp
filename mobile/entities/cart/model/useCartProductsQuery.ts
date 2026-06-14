import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";

import { fetchCatalogProductById } from "@/entities/product/api/fetchCatalogProductById";
import { catalogQueryKeys } from "@/shared/api";
import { DEFAULT_QUERY_STALE_TIME_MS } from "@/shared/config";

export const useCartProductsQuery = (productIds: string[]) => {
  const queries = useQueries({
    queries: productIds.map((productId) => ({
      queryKey: catalogQueryKeys.product(productId),
      queryFn: () => fetchCatalogProductById(productId),
      staleTime: DEFAULT_QUERY_STALE_TIME_MS,
      enabled: Boolean(productId),
    })),
  });

  const products = useMemo(
    () => queries.flatMap((query) => (query.data ? [query.data] : [])),
    [queries],
  );

  const isPending = productIds.length > 0 && queries.some((query) => query.isPending);
  const isError = queries.some((query) => query.isError);
  const isRefetching = queries.some((query) => query.isRefetching);
  const error = queries.find((query) => query.error)?.error ?? null;

  const refetch = async () => {
    await Promise.all(queries.map((query) => query.refetch()));
  };

  return { products, isPending, isError, isRefetching, error, refetch };
};
