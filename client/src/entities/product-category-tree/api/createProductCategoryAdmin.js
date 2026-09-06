import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {import('../model/adminTypes.js').ProductCategoryAdminWritePayload} payload
 */
export async function createProductCategoryAdmin(payload) {
  try {
    const { data } = await apiClient.post("/product/admin/categories", payload);
    if (!data?.success || !data.data?.category) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    // Родитель-лист углубляется сервером, и его товары переезжают в новую
    // категорию — сколько именно, продавцу и админу важно увидеть.
    return {
      category: data.data.category,
      movedProductCount: Number(data.data.movedProductCount) || 0,
    };
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? "Не удалось создать категорию";
    throw new Error(message);
  }
}
