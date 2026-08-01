import {
  cancelMySellerPersonalCategoryCampaign,
  getMySellerPersonalCategoryCampaign,
  getSellerPersonalCategoryCatalogTiles,
  getSellerPersonalCategoryConfig,
  submitSellerPersonalCategoryCampaign,
} from "../../services/seller-personal-category/sellerPersonalCategory.js";
import { successRes } from "../../services/http/index.js";

export const getSellerPersonalCategoryConfigController = async (req, res) => {
  const result = getSellerPersonalCategoryConfig();
  return successRes(res, result);
};

export const getSellerPersonalCategoryCatalogTilesController = async (req, res) => {
  const { resolveViewerRegionCodeForRequest } =
    await import("../../services/user/userRegionCatalogFilter.js");
  const viewerRegionCode = await resolveViewerRegionCodeForRequest({
    userId: req.userId,
    queryRegionCode: req.query.regionCode,
  });
  const result = await getSellerPersonalCategoryCatalogTiles({ viewerRegionCode });
  return successRes(res, result);
};

export const getMySellerPersonalCategoryCampaignController = async (req, res) => {
  const result = await getMySellerPersonalCategoryCampaign({
    userId: String(req.userId),
  });
  return successRes(res, result);
};

export const submitSellerPersonalCategoryCampaignController = async (req, res) => {
  const result = await submitSellerPersonalCategoryCampaign({
    userId: String(req.userId),
    body: req.body,
  });

  return successRes(res, result);
};

export const cancelMySellerPersonalCategoryCampaignController = async (req, res) => {
  const result = await cancelMySellerPersonalCategoryCampaign({
    userId: String(req.userId),
    campaignId: req.params.campaignId,
  });

  return successRes(res, result);
};
