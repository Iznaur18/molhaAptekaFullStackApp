import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {{ regionCode?: string }} [params]
 * @returns {Promise<import('../model/types.js').HomeCuratedCategoryListFromApi[]>}
 */
export async function fetchHomeCuratedCategoryLists({ regionCode } = {}) {
  try {
    const { data } = await apiClient.get("/product/curated-category-lists/home", {
      params: regionCode ? { regionCode } : undefined,
    });
    if (!data?.success || !Array.isArray(data.data?.lists)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.lists;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      "Не удалось загрузить подборки категорий";
    throw new Error(message);
  }
}
