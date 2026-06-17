import {
  approveIntroAdCampaign,
  cancelIntroAdCampaignByStaff,
  countPendingIntroAdCampaigns,
  getManagedIntroAdCampaigns,
  getPendingIntroAdCampaigns,
  rejectIntroAdCampaign,
} from "../../services/intro-ad/introAdCampaign.js";
import { successRes } from "../../services/http/index.js";

export const getPendingIntroAdCampaignsCountController = async (req, res) => {
  const result = await countPendingIntroAdCampaigns();
  return successRes(res, result);
};

export const getPendingIntroAdCampaignsController = async (req, res) => {
  const result = await getPendingIntroAdCampaigns({ query: req.query });
  return successRes(res, result);
};

export const approveIntroAdCampaignController = async (req, res) => {
  const result = await approveIntroAdCampaign({
    staffUserId: req.userId,
    campaignId: req.params.campaignId,
  });

  return successRes(res, result);
};

export const rejectIntroAdCampaignController = async (req, res) => {
  const result = await rejectIntroAdCampaign({
    campaignId: req.params.campaignId,
    reason: req.body?.reason,
  });

  return successRes(res, result);
};

export const getManagedIntroAdCampaignsController = async (req, res) => {
  const result = await getManagedIntroAdCampaigns();
  return successRes(res, result);
};

export const cancelIntroAdCampaignByStaffController = async (req, res) => {
  const result = await cancelIntroAdCampaignByStaff({
    staffUserId: req.userId,
    campaignId: req.params.campaignId,
  });

  return successRes(res, result);
};
