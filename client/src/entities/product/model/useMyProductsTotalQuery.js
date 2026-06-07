import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { fetchMyProductsPage } from "../api/fetchMyProducts.js";
import { myProductsTotalQueryKeys } from "./myProductsTotalQueryKeys.js";

/**
 * @param {{ enabled: boolean }} params
 */
export function useMyProductsTotalQuery({ enabled }) {
  const query = useQuery({
    queryKey: myProductsTotalQueryKeys.all,
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
    query,
    myProductsTotal,
  };
}
