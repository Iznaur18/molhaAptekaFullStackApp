import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} toggleKey
 * @param {{ imageUrl?: string | null; resetImageUrl?: boolean }} body
 */
export async function patchProductManageToggleDisplay(toggleKey, body) {
  try {
    const { data } = await apiClient.patch(
      `/product/manage-toggle-displays/${encodeURIComponent(toggleKey)}`,
      body,
    );

    if (!data?.success || !data.data?.display) {
      throw new Error(API_CLIENT_UI.PATCH_MANAGE_TOGGLE_DISPLAY_FALLBACK);
    }

    return data.data.display;
  } catch (error) {
    const message =
      error?.response?.data?.message ??
      (error instanceof Error
        ? error.message
        : API_CLIENT_UI.PATCH_MANAGE_TOGGLE_DISPLAY_FALLBACK);
    throw new Error(message);
  }
}
