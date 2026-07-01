import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { fetchMyProductsPage } from "@/entities/product/api/fetchMyProductsPage";
import { myProductsQueryKeys } from "@/shared/api";

type UseMyProductsTotalQueryOptions = {
  enabled?: boolean;
};

export const useMyProductsTotalQuery = ({ enabled = true }: UseMyProductsTotalQueryOptions = {}) => {
  const query = useQuery({
    queryKey: myProductsQueryKeys.total(),
    enabled,
    queryFn: () => fetchMyProductsPage({ page: 1, limit: 1 }),
  });

  const myProductsTotal = useMemo(() => {
    if (!enabled) {
      return null;
    }
    if (query.isSuccess) {
      return query.data.pagination.total;
    }
    return null;
  }, [enabled, query.data, query.isSuccess]);

  return {
    ...query,
    myProductsTotal,
  };
};
