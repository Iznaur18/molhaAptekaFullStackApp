import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @returns {Promise<{
 *   displays: import('../model/types.js').ProductCategoryDisplayFromApi[];
 *   tileImagesEnabled: boolean;
 * }>} `tileImagesEnabled` — общий переключатель админа «картинки на плитках».
 */
export async function fetchProductCategoryDisplays() {
  try {
    const { data } = await apiClient.get("/product/category-displays");

    if (!data?.success || !data.data) {
      throw new Error(API_CLIENT_UI.FETCH_CATEGORY_DISPLAYS_FALLBACK);
    }

    return {
      displays: Array.isArray(data.data.displays) ? data.data.displays : [],
      // Старый сервер поля не знает — тогда картинки показываем, как раньше.
      tileImagesEnabled: data.data.tileImagesEnabled !== false,
    };
  } catch (error) {
    const message =
      error?.response?.data?.message ??
      (error instanceof Error
        ? error.message
        : API_CLIENT_UI.FETCH_CATEGORY_DISPLAYS_FALLBACK);
    throw new Error(message);
  }
}
