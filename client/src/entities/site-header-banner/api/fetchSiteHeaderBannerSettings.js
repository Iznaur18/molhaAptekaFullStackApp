import { apiClient } from "../../../shared/api/apiClient.js";

/**
 * @returns {Promise<{ settings: import('../model/types.js').SiteHeaderBannerSettings }>}
 */
export async function fetchSiteHeaderBannerSettings() {
  try {
    const { data } = await apiClient.get("/site-header-banner/settings");
    return data?.data ?? data;
  } catch (error) {
    throw error;
  }
}
