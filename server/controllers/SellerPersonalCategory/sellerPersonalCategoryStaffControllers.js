import {
  approveSellerPersonalCategoryCampaign,
  countPendingSellerPersonalCategoryCampaigns,
  getPendingSellerPersonalCategoryCampaigns,
  rejectSellerPersonalCategoryCampaign,
} from "../../services/seller-personal-category/sellerPersonalCategoryStaff.js";
import { successRes } from "../../services/http/index.js";

export const getPendingSellerPersonalCategoryCampaignsCountController = async (req, res) => {
  const result = await countPendingSellerPersonalCategoryCampaigns();
  return successRes(res, result);
};

export const getPendingSellerPersonalCategoryCampaignsController = async (req, res) => {
  const result = await getPendingSellerPersonalCategoryCampaigns({ query: req.query });
  return successRes(res, result);
};

export const approveSellerPersonalCategoryCampaignController = async (req, res) => {
  const result = await approveSellerPersonalCategoryCampaign({
    staffUserId: req.userId,
    campaignId: req.params.campaignId,
  });

  return successRes(res, result);
};

export const rejectSellerPersonalCategoryCampaignController = async (req, res) => {
  const result = await rejectSellerPersonalCategoryCampaign({
    campaignId: req.params.campaignId,
    reason: req.body?.reason,
  });

  return successRes(res, result);
};
