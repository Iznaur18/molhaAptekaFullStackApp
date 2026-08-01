import { useMemo } from "react";

import { useProductBadgeExplainsQuery } from "../model/useProductBadgeExplainsQuery.js";

/**
 * @returns {Map<string, import("../model/types.js").ProductBadgeExplainFromApi>}
 */
export function useProductBadgeExplainByKeyMap(options = {}) {
  const query = useProductBadgeExplainsQuery(options);

  return useMemo(() => {
    const map = new Map();
    for (const row of query.data?.displays ?? []) {
      map.set(row.badgeKey, row);
    }
    return map;
  }, [query.data?.displays]);
}
