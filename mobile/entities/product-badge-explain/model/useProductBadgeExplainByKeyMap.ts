import { useMemo } from "react";

import { useProductBadgeExplainsQuery } from "./useProductBadgeExplainsQuery";
import type { ProductBadgeExplainFromApi } from "./types";

export const useProductBadgeExplainByKeyMap = (options: { enabled?: boolean } = {}) => {
  const query = useProductBadgeExplainsQuery(options);

  return useMemo(() => {
    const map = new Map<string, ProductBadgeExplainFromApi>();
    for (const row of query.data ?? []) {
      map.set(row.badgeKey, row);
    }
    return map;
  }, [query.data]);
};
