import { formatCuratedProductRegionMismatchMessage } from "@molha/api-contract";

/**
 * @param {{
 *   preview: {
 *     productRegionCode?: string;
 *     catalogVisible?: boolean;
 *   } | null;
 *   listRegionCode: string;
 * }} input
 */
export function resolveCuratedAddProductBlockReason({ preview, listRegionCode }) {
  if (!preview) {
    return null;
  }
  if (!preview.catalogVisible) {
    return "catalog";
  }
  if (
    String(preview.productRegionCode ?? "").trim() !==
    String(listRegionCode ?? "").trim()
  ) {
    return formatCuratedProductRegionMismatchMessage(
      preview.productRegionCode,
      listRegionCode,
    );
  }
  return null;
}
