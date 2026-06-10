import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} categoryId
 * @param {{
 *   customLabel?: string | null;
 *   imageUrl?: string | null;
 *   resetCustomLabel?: boolean;
 *   resetImageUrl?: boolean;
 * }} body
 * @returns {Promise<{ display: import('../model/types.js').ProductCategoryDisplayFromApi }>}
 */
export async function patchProductCategoryNodeDisplay(categoryId, body) {
  try {
    const { data } = await apiClient.patch(
      `/product/category-node-displays/${encodeURIComponent(categoryId)}`,
      body,
    );

    if (!data?.success || !data.data?.display) {
      throw new Error(API_CLIENT_UI.PATCH_CATEGORY_DISPLAY_FALLBACK);
    }

    return { display: data.data.display };
  } catch (error) {
    const message =
      error?.response?.data?.message ??
      (error instanceof Error
        ? error.message
        : API_CLIENT_UI.PATCH_CATEGORY_DISPLAY_FALLBACK);
    throw new Error(message);
  }
}
