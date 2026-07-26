import { submitSiteHeaderBannerCampaignBodySchema } from "@molha/api-contract";

/**
 * @param {Record<string, unknown>} body
 */
export const parseSiteHeaderBannerCampaignSubmitBody = (body) => {
  const parsed = submitSiteHeaderBannerCampaignBodySchema.parse(body ?? {});

  return {
    imageUrl: parsed.imageUrl,
    imageAlt: parsed.imageAlt,
    linkPath: parsed.linkPath ?? null,
    backgroundColor: parsed.backgroundColor ?? null,
    regionCode: parsed.regionCode,
    amountPoints: undefined,
  };
};
