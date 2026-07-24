import { apiClient } from "../../../shared/api/apiClient.js";

const FETCH_GUEST_BANNER_FALLBACK =
  "Не удалось загрузить баннер входа профиля";

/**
 * @returns {Promise<string | null>}
 */
export async function fetchGuestProfileLoginMenuBannerImageUrl() {
  try {
    const { data } = await apiClient.get("/site-header-banner");
    const payload = data?.data ?? data;
    const url = payload?.guestProfileLoginMenuBannerImageUrl;
    if (url == null || String(url).trim() === "") {
      return null;
    }
    return String(url).trim();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : FETCH_GUEST_BANNER_FALLBACK;
    throw new Error(message);
  }
}
