import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} itemId
 * @param {{ href?: string | null; resetHref?: boolean }} body
 * @returns {Promise<{ link: import("./fetchFaqItemLinks.js").FaqItemLinkFromApi }>}
 */
export async function patchFaqItemLink(itemId, body) {
  try {
    const { data } = await apiClient.patch(`/faq/item-links/${itemId}`, body);

    if (!data?.success || !data.data?.link) {
      throw new Error(API_CLIENT_UI.PATCH_FAQ_ITEM_LINK_FALLBACK);
    }

    return { link: data.data.link };
  } catch (error) {
    const message =
      error?.response?.data?.message ??
      (error instanceof Error
        ? error.message
        : API_CLIENT_UI.PATCH_FAQ_ITEM_LINK_FALLBACK);
    throw new Error(message);
  }
}
