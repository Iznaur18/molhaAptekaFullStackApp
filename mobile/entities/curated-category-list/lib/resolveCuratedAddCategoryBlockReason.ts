import { formatCuratedCategoryRegionMismatchMessage } from "@molha/api-contract";

import type { CuratedCategoryListItemPreview } from "../api/curatedCategoryListAdminApi";

/**
 * Паритет с web `resolveCuratedAddCategoryBlockReason.js`.
 * Возвращает "catalog" (категория не видна в каталоге), строку-сообщение
 * (регион не совпадает) или null (можно добавить).
 */
export const resolveCuratedAddCategoryBlockReason = ({
  preview,
  listRegionCode,
}: {
  preview: CuratedCategoryListItemPreview | null;
  listRegionCode: string;
}): "catalog" | string | null => {
  if (!preview) {
    return null;
  }

  if (!preview.catalogVisible) {
    return "catalog";
  }

  if (preview.kind === "personal" && preview.regionCode && listRegionCode) {
    if (preview.regionCode !== listRegionCode) {
      return formatCuratedCategoryRegionMismatchMessage(
        preview.regionCode,
        listRegionCode,
      );
    }
  }

  return null;
};
