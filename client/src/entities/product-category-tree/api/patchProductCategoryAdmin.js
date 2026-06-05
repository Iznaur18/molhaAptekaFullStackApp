import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} categoryId
 * @param {Partial<import('../model/adminTypes.js').ProductCategoryAdminWritePayload>} payload
 */
export async function patchProductCategoryAdmin(categoryId, payload) {
  try {
    const { data } = await apiClient.patch(
      `/product/admin/categories/${categoryId}`,
      payload,
    );
    if (!data?.success || !data.data?.category) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.category;
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? "Не удалось обновить категорию";
    throw new Error(message);
  }
}
