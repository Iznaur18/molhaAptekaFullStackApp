import { apiClient } from "../../../shared/api/apiClient.js";

/**
 * @param {{ regionCode?: string }} [options]
 * @returns {Promise<{ slides: import('../model/types.js').SiteHeaderBannerSlide[] }>}
 */
export async function fetchSiteHeaderBannerSlides({ regionCode } = {}) {
  try {
    const { data } = await apiClient.get("/site-header-banner", {
      params: regionCode ? { regionCode } : undefined,
    });
    return data?.data ?? data;
  } catch (error) {
    throw error;
  }
}
