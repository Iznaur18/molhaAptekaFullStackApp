import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @typedef {{ itemId: string; href: string | null; updatedAt?: string | null }} FaqItemLinkFromApi
 */

/**
 * @returns {Promise<{ links: FaqItemLinkFromApi[] }>}
 */
export async function fetchFaqItemLinks() {
  try {
    const { data } = await apiClient.get("/faq/item-links");

    if (!data?.success || !Array.isArray(data.data?.links)) {
      throw new Error(API_CLIENT_UI.FETCH_FAQ_ITEM_LINKS_FALLBACK);
    }

    return { links: data.data.links };
  } catch (error) {
    const message =
      error?.response?.data?.message ??
      (error instanceof Error
        ? error.message
        : API_CLIENT_UI.FETCH_FAQ_ITEM_LINKS_FALLBACK);
    throw new Error(message);
  }
}
