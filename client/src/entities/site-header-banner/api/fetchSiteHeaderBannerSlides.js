import { apiClient } from "../../../shared/api/apiClient.js";

/**
 * @returns {Promise<{ slides: import('../model/types.js').SiteHeaderBannerSlide[] }>}
 */
export async function fetchSiteHeaderBannerSlides() {
  try {
    const { data } = await apiClient.get("/site-header-banner");
    return data?.data ?? data;
  } catch (error) {
    throw error;
  }
}
