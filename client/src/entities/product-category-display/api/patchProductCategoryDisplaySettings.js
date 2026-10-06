import { apiClient } from "../../../shared/api/index.js";
import { CATEGORY_TILE_IMAGES_UI } from "../../../shared/config/appUiCopy.js";

/**
 * `PATCH /product/category-display-settings` — показывать ли картинки на
 * плитках категорий (только админ).
 *
 * @param {{ tileImagesEnabled: boolean }} body
 * @returns {Promise<{ tileImagesEnabled: boolean }>}
 */
export async function patchProductCategoryDisplaySettings(body) {
  try {
    const { data } = await apiClient.patch("/product/category-display-settings", body);

    if (!data?.success || typeof data.data?.tileImagesEnabled !== "boolean") {
      throw new Error(CATEGORY_TILE_IMAGES_UI.SAVE_FALLBACK);
    }

    return { tileImagesEnabled: data.data.tileImagesEnabled };
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ??
        (error instanceof Error
          ? error.message
          : CATEGORY_TILE_IMAGES_UI.SAVE_FALLBACK),
    );
  }
}
