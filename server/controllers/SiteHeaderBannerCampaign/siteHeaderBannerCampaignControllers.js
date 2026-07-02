import {
  cancelMySiteHeaderBannerCampaign,
  getMySiteHeaderBannerCampaign,
  getSiteHeaderBannerCampaignConfig,
  submitSiteHeaderBannerCampaign,
} from "../../services/site-header-banner-campaign/siteHeaderBannerCampaign.js";
import { successRes } from "../../services/http/index.js";

export const getSiteHeaderBannerCampaignConfigController = async (_req, res) => {
  const result = await getSiteHeaderBannerCampaignConfig();
  return successRes(res, result);
};

export const getMySiteHeaderBannerCampaignController = async (req, res) => {
  const result = await getMySiteHeaderBannerCampaign({ userId: String(req.userId) });
  return successRes(res, result);
};

export const submitSiteHeaderBannerCampaignController = async (req, res) => {
  const result = await submitSiteHeaderBannerCampaign({
    userId: String(req.userId),
    body: req.body,
  });

  return successRes(res, result);
};

export const cancelMySiteHeaderBannerCampaignController = async (req, res) => {
  const result = await cancelMySiteHeaderBannerCampaign({
    userId: String(req.userId),
    campaignId: req.params.campaignId,
  });

  return successRes(res, result);
};
