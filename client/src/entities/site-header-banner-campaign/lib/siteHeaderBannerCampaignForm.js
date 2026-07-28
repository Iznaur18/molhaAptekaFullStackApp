import { submitSiteHeaderBannerCampaignBodySchema } from "@molha/api-contract";
import { DEFAULT_VIEWER_REGION_CODE, isRuRegionCode } from "@molha/api-contract";

import { SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {{
 *   imageUrl: string;
 *   imageAlt: string;
 *   linkPath: string;
 *   backgroundColor: string;
 *   regionCode: string;
 * }} form
 * @returns {string | null}
 */
export const validateSiteHeaderBannerCampaignForm = (form) => {
  const imageUrl = String(form.imageUrl ?? "").trim();
  const imageAlt = String(form.imageAlt ?? "").trim();
  const regionCode = String(form.regionCode ?? "").trim();

  if (!imageUrl) {
    return "Загрузите изображение баннера";
  }

  if (!imageAlt) {
    return "Укажите alt-текст баннера";
  }

  if (!isRuRegionCode(regionCode)) {
    return SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI.ERROR_REGION_REQUIRED;
  }

  try {
    submitSiteHeaderBannerCampaignBodySchema.parse({
      imageUrl,
      imageAlt,
      linkPath: String(form.linkPath ?? "").trim() || null,
      backgroundColor: String(form.backgroundColor ?? "").trim() || null,
      regionCode,
    });
  } catch {
    return "Проверьте поля баннера";
  }

  return null;
};

/**
 * @param {{
 *   imageUrl: string;
 *   imageAlt: string;
 *   linkPath: string;
 *   backgroundColor: string;
 *   regionCode: string;
 * }} form
 */
export const buildSubmitSiteHeaderBannerCampaignBody = (form) => ({
  imageUrl: String(form.imageUrl ?? "").trim(),
  imageAlt: String(form.imageAlt ?? "").trim(),
  linkPath: String(form.linkPath ?? "").trim() || null,
  backgroundColor: String(form.backgroundColor ?? "").trim() || null,
  regionCode: String(form.regionCode ?? "").trim(),
});

export const createEmptySiteHeaderBannerCampaignForm = () => ({
  imageUrl: "",
  imageAlt: "",
  linkPath: "",
  backgroundColor: "",
  regionCode: DEFAULT_VIEWER_REGION_CODE,
});
