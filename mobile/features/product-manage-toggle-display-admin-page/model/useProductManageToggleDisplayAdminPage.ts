import { useMemo } from "react";

import { useProductManageToggleDisplaysQuery } from "@/entities/product-manage-toggle-display/model/useProductManageToggleDisplaysQuery";

export const useProductManageToggleDisplayAdminPage = () => {
  const displaysQuery = useProductManageToggleDisplaysQuery();

  const displaysByKey = useMemo(() => {
    const map = new Map<string, string | null>();
    for (const row of displaysQuery.data ?? []) {
      map.set(row.toggleKey, row.imageUrl);
    }
    return map;
  }, [displaysQuery.data]);

  return {
    displaysByKey,
    phase: displaysQuery.isPending ? "loading" : displaysQuery.isError ? "error" : "ready",
    queryError: displaysQuery.error,
    refetchDisplays: displaysQuery.refetch,
  };
};
