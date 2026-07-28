import {
  DEFAULT_VIEWER_REGION_CODE,
  isRuRegionCode,
  submitSiteHeaderBannerCampaignBodySchema,
} from "@molha/api-contract";

import { SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI } from "@/shared/config";

export type SiteHeaderBannerCampaignFormState = {
  imageUrl: string;
  imageAlt: string;
  linkPath: string;
  backgroundColor: string;
  regionCode: string;
};

export const createSiteHeaderBannerCampaignFormState =
  (): SiteHeaderBannerCampaignFormState => ({
    imageUrl: "",
    imageAlt: "",
    linkPath: "",
    backgroundColor: "",
    regionCode: DEFAULT_VIEWER_REGION_CODE,
  });

export const validateSiteHeaderBannerCampaignForm = (
  form: SiteHeaderBannerCampaignFormState,
): string | null => {
  const imageUrl = form.imageUrl.trim();
  const imageAlt = form.imageAlt.trim();
  const regionCode = form.regionCode.trim();

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
      linkPath: form.linkPath.trim() || null,
      backgroundColor: form.backgroundColor.trim() || null,
      regionCode,
    });
  } catch {
    return "Проверьте поля баннера";
  }

  return null;
};

export const buildSubmitSiteHeaderBannerCampaignBody = (
  form: SiteHeaderBannerCampaignFormState,
) => ({
  imageUrl: form.imageUrl.trim(),
  imageAlt: form.imageAlt.trim(),
  linkPath: form.linkPath.trim() || null,
  backgroundColor: form.backgroundColor.trim() || null,
  regionCode: form.regionCode.trim(),
});
