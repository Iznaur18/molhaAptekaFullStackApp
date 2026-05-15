import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * `POST /product/:productId/view` — зафиксировать уникальный просмотр (Bearer).
 *
 * @param {string} productId
 * @returns {Promise<{ recorded: boolean; uniqueViewerCount: number }>}
 */
export async function recordProductView(productId) {
  try {
    const { data } = await apiClient.post(`/product/${productId}/view`);

    if (
      !data?.success ||
      data.data?.uniqueViewerCount == null ||
      Number.isNaN(Number(data.data.uniqueViewerCount))
    ) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return {
      recorded: Boolean(data.data.recorded),
      uniqueViewerCount: Number(data.data.uniqueViewerCount) || 0,
    };
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.RECORD_PRODUCT_VIEW_FALLBACK;
    throw new Error(message);
  }
}
