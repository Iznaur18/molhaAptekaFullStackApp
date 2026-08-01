import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} badgeKey
 * @param {{
 *   imageUrl?: string | null;
 *   description?: string | null;
 *   resetImageUrl?: boolean;
 *   resetDescription?: boolean;
 * }} body
 */
export async function patchProductBadgeExplain(badgeKey, body) {
  try {
    const { data } = await apiClient.patch(
      `/product/badge-explains/${encodeURIComponent(badgeKey)}`,
      body,
    );

    if (!data?.success || !data.data?.display) {
      throw new Error(API_CLIENT_UI.PATCH_BADGE_EXPLAIN_FALLBACK);
    }

    return data.data.display;
  } catch (error) {
    const message =
      error?.response?.data?.message ??
      (error instanceof Error
        ? error.message
        : API_CLIENT_UI.PATCH_BADGE_EXPLAIN_FALLBACK);
    throw new Error(message);
  }
}
