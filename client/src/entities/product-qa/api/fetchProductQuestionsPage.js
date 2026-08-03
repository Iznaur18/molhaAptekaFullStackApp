import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";
import { PRODUCT_QUESTION_PAGE_LIMIT } from "../model/constants.js";

/**
 * @param {string} productId
 * @param {{ page?: number; limit?: number; status?: 'pending' | 'answered' }} [params]
 */
export async function fetchProductQuestionsPage(productId, params = {}) {
  try {
    const page = params.page ?? 1;
    const limit = params.limit ?? PRODUCT_QUESTION_PAGE_LIMIT;
    /** @type {Record<string, unknown>} */
    const query = { page, limit };
    if (params.status) {
      query.status = params.status;
    }
    const { data } = await apiClient.get(`/product/${productId}/questions`, {
      params: query,
    });

    if (!data?.success || !Array.isArray(data.data?.questions)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return {
      questions: /** @type {import('../model/types.js').ProductQuestionFromApi[]} */ (
        data.data.questions
      ),
      pagination: /** @type {import('../model/types.js').ProductQuestionPagination} */ (
        data.data.pagination
      ),
    };
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_PRODUCT_QUESTIONS_FALLBACK;
    throw new Error(message);
  }
}
