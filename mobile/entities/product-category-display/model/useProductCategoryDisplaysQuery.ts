import { useQuery } from "@tanstack/react-query";

import { categoryDisplayQueryKeys } from "@/shared/api";
import { DEFAULT_QUERY_STALE_TIME_MS } from "@/shared/config";

import { fetchProductCategoryDisplays } from "../api/fetchProductCategoryDisplays";

export const useProductCategoryDisplaysQuery = () => {
  return useQuery({
    queryKey: categoryDisplayQueryKeys.all,
    queryFn: fetchProductCategoryDisplays,
    staleTime: DEFAULT_QUERY_STALE_TIME_MS,
    select: (data) => data.displays,
  });
};

/**
 * Показывать ли картинки на плитках ВЛОЖЕННЫХ категорий — общий переключатель
 * админа; плитки первого уровня показываются с картинками всегда
 * (включается на сайте). Приезжает тем же запросом, что и сами плитки.
 * Пока ответа нет — показываем, как раньше.
 */
export const useCategoryTileImagesEnabled = (): boolean => {
  const query = useQuery({
    queryKey: categoryDisplayQueryKeys.all,
    queryFn: fetchProductCategoryDisplays,
    staleTime: DEFAULT_QUERY_STALE_TIME_MS,
    select: (data) => data.tileImagesEnabled,
  });
  return query.data !== false;
};
