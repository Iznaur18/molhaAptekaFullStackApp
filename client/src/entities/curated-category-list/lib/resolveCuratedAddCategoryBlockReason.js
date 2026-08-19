import { formatCuratedCategoryRegionMismatchMessage } from "@molha/api-contract";

/**
 * @param {{
 *   preview: import('./types.js').CuratedCategoryListItemPreviewFromApi | null;
 *   listRegionCode: string;
 * }} params
 * @returns {"catalog" | string | null}
 */
export function resolveCuratedAddCategoryBlockReason({ preview, listRegionCode }) {
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
}
