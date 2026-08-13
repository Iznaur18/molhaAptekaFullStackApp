import { apiClient } from "../../../shared/api/apiClient.js";

/**
 * @param {import('@molha/api-contract').patchSiteHeaderBannerSettingsBodySchema['_input']} body
 * @returns {Promise<{ settings: import('../model/types.js').SiteHeaderBannerSettings }>}
 */
export async function patchSiteHeaderBannerSettings(body) {
  const { data } = await apiClient.patch("/site-header-banner/settings", body);
  return data?.data ?? data;
}
