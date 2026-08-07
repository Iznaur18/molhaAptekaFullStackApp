import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @typedef {{
 *   productId: string;
 *   productName: string;
 *   productRegionCode: string;
 *   regionLabel: string;
 *   catalogVisible: boolean;
 * }} CuratedListProductPreview
 */

/**
 * @param {string} productId
 * @returns {Promise<CuratedListProductPreview>}
 */
export async function fetchCuratedListProductPreviewAdmin(productId) {
  try {
    const { data } = await apiClient.get(
      `/product/admin/curated-lists/product-preview/${encodeURIComponent(productId)}`,
    );
    if (!data?.success || !data.data?.preview) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.preview;
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? "Не удалось загрузить товар";
    throw new Error(message);
  }
}
