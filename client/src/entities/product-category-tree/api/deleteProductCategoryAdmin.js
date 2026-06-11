import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} categoryId
 * @param {{ reassignProductCategoryId?: string; detachProducts?: boolean }} [options]
 */
export async function deleteProductCategoryAdmin(categoryId, options = {}) {
  try {
    const reassignProductCategoryId = String(
      options.reassignProductCategoryId ?? "",
    ).trim();
    const detachProducts = options.detachProducts === true;
    const payload =
      reassignProductCategoryId || detachProducts
        ? {
            ...(reassignProductCategoryId ? { reassignProductCategoryId } : {}),
            ...(detachProducts ? { detachProducts: true } : {}),
          }
        : undefined;
    const { data } = await apiClient.delete(
      `/product/admin/categories/${categoryId}`,
      payload ? { data: payload } : undefined,
    );
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? "Не удалось удалить категорию";
    throw new Error(message);
  }
}
