import {
  cancelMyIntroAdCampaign,
  getIntroAdConfig,
  getMyIntroAdCampaign,
  submitIntroAdCampaign,
} from "../../services/intro-ad/introAdCampaign.js";
import { successRes } from "../../services/http/index.js";

export const getIntroAdConfigController = async (req, res) => {
  const result = getIntroAdConfig();
  return successRes(res, result);
};

export const getMyIntroAdCampaignController = async (req, res) => {
  const result = await getMyIntroAdCampaign({ userId: String(req.userId) });
  return successRes(res, result);
};

export const submitIntroAdCampaignController = async (req, res) => {
  const result = await submitIntroAdCampaign({
    userId: String(req.userId),
    body: req.body,
  });

  return successRes(res, result);
};

export const cancelMyIntroAdCampaignController = async (req, res) => {
  const result = await cancelMyIntroAdCampaign({
    userId: String(req.userId),
    campaignId: req.params.campaignId,
  });

  return successRes(res, result);
};
