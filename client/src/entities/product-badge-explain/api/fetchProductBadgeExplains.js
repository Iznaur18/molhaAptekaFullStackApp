import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @returns {Promise<{ displays: import("../model/types.js").ProductBadgeExplainFromApi[] }>}
 */
export async function fetchProductBadgeExplains() {
  try {
    const { data } = await apiClient.get("/product/badge-explains");

    if (!data?.success || !Array.isArray(data.data?.displays)) {
      throw new Error(API_CLIENT_UI.FETCH_BADGE_EXPLAINS_FALLBACK);
    }

    return { displays: data.data.displays };
  } catch (error) {
    const message =
      error?.response?.data?.message ??
      (error instanceof Error
        ? error.message
        : API_CLIENT_UI.FETCH_BADGE_EXPLAINS_FALLBACK);
    throw new Error(message);
  }
}
