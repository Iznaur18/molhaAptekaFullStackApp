import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} productId
 * @param {string} questionId
 */
export async function deleteMyProductQuestion(productId, questionId) {
  try {
    const { data } = await apiClient.delete(
      `/product/${productId}/questions/${questionId}`,
    );

    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return data.data;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.DELETE_PRODUCT_QUESTION_FALLBACK;
    throw new Error(message);
  }
}
