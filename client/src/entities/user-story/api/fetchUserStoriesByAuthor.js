import { userStoriesByAuthorDataSchema } from "@molha/api-contract";

import { apiClient } from "../../../shared/api/index.js";
import { parseApiContractData } from "../../../shared/api/parseApiContract.js";

/**
 * @param {string} authorUserId
 * @returns {Promise<import('../model/types.js').UserStoryFromApi[]>}
 */
export async function fetchUserStoriesByAuthor(authorUserId) {
  try {
    const { data } = await apiClient.get(
      `/user/stories/author/${encodeURIComponent(authorUserId)}`,
    );

    return parseApiContractData(data, userStoriesByAuthorDataSchema).stories;
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? "Не удалось загрузить сторисы автора";
    throw new Error(message);
  }
}
