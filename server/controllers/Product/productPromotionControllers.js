import {
  approveProductPromotion,
  countPendingProductPromotions,
  getMyProductPromotions,
  getPendingProductPromotions,
  getProductPromotionTariffs,
  rejectProductPromotion,
  requestProductPromotion,
} from "../../services/product/productPromotion.js";
import { successRes } from "../../services/http/index.js";

export const getProductPromotionTariffsController = async (req, res) => {
  const result = getProductPromotionTariffs();
  return successRes(res, result);
};

export const requestProductPromotionController = async (req, res) => {
  const result = await requestProductPromotion({
    userId: String(req.userId),
    productId: req.params.productId,
    tier: req.body?.tier,
    tariffCode: req.body?.tariffCode,
  });

  return successRes(res, result);
};

export const getMyProductPromotionsController = async (req, res) => {
  const result = await getMyProductPromotions({
    userId: String(req.userId),
    query: req.query,
  });

  return successRes(res, result);
};

export const getPendingProductPromotionsController = async (req, res) => {
  const result = await getPendingProductPromotions();
  return successRes(res, result);
};

export const getPendingProductPromotionsCountController = async (req, res) => {
  const result = await countPendingProductPromotions();
  return successRes(res, result);
};

export const approveProductPromotionController = async (req, res) => {
  const result = await approveProductPromotion({
    staffId: String(req.userId),
    promotionId: req.params.promotionId,
  });

  return successRes(res, result);
};

export const rejectProductPromotionController = async (req, res) => {
  const result = await rejectProductPromotion({
    staffId: String(req.userId),
    promotionId: req.params.promotionId,
  });

  return successRes(res, result);
};
