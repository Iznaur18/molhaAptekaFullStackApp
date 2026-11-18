import { successRes } from "../../services/http/index.js";
import {
  activateProductPromoCode,
  listAppliedProductPromosForUser,
  listProductPromoCodesForOwner,
  replaceProductPromoCodes,
} from "../../services/product/productPromoCode.js";

export const listProductPromoCodesController = async (req, res) => {
  const data = await listProductPromoCodesForOwner({
    userId: String(req.userId),
    productId: String(req.params.productId),
  });
  return successRes(res, data);
};

export const replaceProductPromoCodesController = async (req, res) => {
  const data = await replaceProductPromoCodes({
    userId: String(req.userId),
    productId: String(req.params.productId),
    promoCodes: req.body.promoCodes,
  });
  return successRes(res, data);
};

export const activateProductPromoCodeController = async (req, res) => {
  const data = await activateProductPromoCode({
    userId: String(req.userId),
    productId: String(req.params.productId),
    code: req.body.code,
  });
  return successRes(res, data);
};

export const listMyAppliedProductPromosController = async (req, res) => {
  const appliedPromos = await listAppliedProductPromosForUser({
    userId: String(req.userId),
  });
  return successRes(res, { appliedPromos });
};
