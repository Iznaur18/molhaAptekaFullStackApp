import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} productId
 * @param {string} questionId
 * @param {{ text: string }} payload
 */
export async function answerProductQuestion(productId, questionId, payload) {
  try {
    const { data } = await apiClient.put(
      `/product/${productId}/questions/${questionId}/answer`,
      payload,
    );

    if (!data?.success || data.data?.question == null) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return data.data;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.ANSWER_PRODUCT_QUESTION_FALLBACK;
    throw new Error(message);
  }
}
