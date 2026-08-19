import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {"tree" | "personal"} kind
 * @param {string} refId
 * @returns {Promise<import('../model/types.js').CuratedCategoryListItemPreviewFromApi>}
 */
export async function fetchCuratedCategoryListItemPreviewAdmin(kind, refId) {
  try {
    const { data } = await apiClient.get("/product/admin/curated-category-lists/item-preview", {
      params: { kind, refId },
    });
    if (!data?.success || !data.data?.preview) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.preview;
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? "Не удалось загрузить превью";
    throw new Error(message);
  }
}
