import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {{ allCities?: boolean }} [params]
 * @returns {Promise<import('../model/types.js').HomeCuratedProductListFromApi[]>}
 */
export async function fetchHomeCuratedProductLists({ allCities = false } = {}) {
  try {
    const { data } = await apiClient.get("/product/curated-lists/home", {
      params: allCities ? { allCities: "true" } : undefined,
    });
    if (!data?.success || !Array.isArray(data.data?.lists)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.lists;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      "Не удалось загрузить подборки товаров";
    throw new Error(message);
  }
}
