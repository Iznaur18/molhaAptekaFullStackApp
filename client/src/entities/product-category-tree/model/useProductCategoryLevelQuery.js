import { useProductCategoryChildrenQuery } from "./useProductCategoryChildrenQuery.js";
import { useProductCategoryRootsQuery } from "./useProductCategoryRootsQuery.js";

/**
 * @param {{ parentId: string | null; enabled?: boolean }} params
 */
export function useProductCategoryLevelQuery({ parentId, enabled = true }) {
  const isRoot = parentId == null;

  const rootsQuery = useProductCategoryRootsQuery({
    enabled: enabled && isRoot,
  });
  const childrenQuery = useProductCategoryChildrenQuery({
    parentId: parentId ?? "",
    enabled: enabled && !isRoot,
  });

  const activeQuery = isRoot ? rootsQuery : childrenQuery;
  const categories = activeQuery.data ?? [];

  return {
    categories,
    isLoading: activeQuery.isLoading,
    isError: activeQuery.isError,
    error: activeQuery.error,
    refetch: activeQuery.refetch,
  };
}
