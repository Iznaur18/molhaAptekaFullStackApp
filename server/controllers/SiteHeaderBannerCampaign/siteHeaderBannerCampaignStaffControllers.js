import {
  approveSiteHeaderBannerCampaign,
  cancelSiteHeaderBannerCampaignByStaff,
  countPendingSiteHeaderBannerCampaigns,
  getManagedSiteHeaderBannerCampaigns,
  getPendingSiteHeaderBannerCampaigns,
  rejectSiteHeaderBannerCampaign,
} from "../../services/site-header-banner-campaign/siteHeaderBannerCampaignStaff.js";
import { successRes } from "../../services/http/index.js";

export const getPendingSiteHeaderBannerCampaignsCountController = async (_req, res) => {
  const result = await countPendingSiteHeaderBannerCampaigns();
  return successRes(res, result);
};

export const getPendingSiteHeaderBannerCampaignsController = async (req, res) => {
  const result = await getPendingSiteHeaderBannerCampaigns({ query: req.query });
  return successRes(res, result);
};

export const approveSiteHeaderBannerCampaignController = async (req, res) => {
  const result = await approveSiteHeaderBannerCampaign({
    staffUserId: req.userId,
    campaignId: req.params.campaignId,
  });

  return successRes(res, result);
};

export const rejectSiteHeaderBannerCampaignController = async (req, res) => {
  const result = await rejectSiteHeaderBannerCampaign({
    campaignId: req.params.campaignId,
    reason: req.body?.reason,
  });

  return successRes(res, result);
};

export const getManagedSiteHeaderBannerCampaignsController = async (_req, res) => {
  const result = await getManagedSiteHeaderBannerCampaigns();
  return successRes(res, result);
};

export const cancelSiteHeaderBannerCampaignByStaffController = async (req, res) => {
  const result = await cancelSiteHeaderBannerCampaignByStaff({
    staffUserId: req.userId,
    campaignId: req.params.campaignId,
  });

  return successRes(res, result);
};
