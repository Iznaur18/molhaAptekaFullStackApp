import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchProductCategoryDisplays } from "../api/fetchProductCategoryDisplays.js";
import { patchProductCategoryDisplaySettings } from "../api/patchProductCategoryDisplaySettings.js";
import { productCategoryDisplayQueryKeys } from "./productCategoryDisplayQueryKeys.js";

/** @typedef {"pending" | "on" | "off"} CategoryTileImagesMode */

/**
 * Показывать ли картинки на плитках категорий — общий переключатель админа.
 * Приезжает тем же запросом, что и сами плитки, отдельного похода нет.
 *
 * `pending` — ответа ещё нет: картинку не рисуем, чтобы при выключенных
 * картинках она не мелькала на первой загрузке.
 *
 * @returns {CategoryTileImagesMode}
 */
export function useCategoryTileImagesMode() {
  const query = useQuery({
    queryKey: productCategoryDisplayQueryKeys.categories(),
    queryFn: fetchProductCategoryDisplays,
    select: (data) => data.tileImagesEnabled,
  });

  if (query.data === undefined) {
    // Запрос упал — показываем как раньше, с картинками.
    return query.isError ? "on" : "pending";
  }
  return query.data ? "on" : "off";
}

/** Включить или выключить картинки на всех плитках категорий (админ). */
export function useSetCategoryTileImagesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchProductCategoryDisplaySettings,
    onSuccess: ({ tileImagesEnabled }) => {
      queryClient.setQueryData(productCategoryDisplayQueryKeys.categories(), (prev) =>
        prev ? { ...prev, tileImagesEnabled } : prev,
      );
    },
  });
}
