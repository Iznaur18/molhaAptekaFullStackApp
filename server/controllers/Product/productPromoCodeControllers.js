import { errorRes, successRes } from "../../services/http/index.js";
import {
  activateProductPromoCode,
  listAppliedProductPromosForUser,
  listProductPromoCodesForOwner,
  replaceProductPromoCodes,
} from "../../services/product/productPromoCode.js";

export const listProductPromoCodesController = async (req, res) => {
  const userId = String(req.userId ?? "");
  if (!userId) {
    return errorRes(res, 401, "Не авторизован");
  }
  const data = await listProductPromoCodesForOwner({
    userId,
    productId: String(req.params.productId),
  });
  return successRes(res, data);
};

export const replaceProductPromoCodesController = async (req, res) => {
  const userId = String(req.userId ?? "");
  if (!userId) {
    return errorRes(res, 401, "Не авторизован");
  }
  const data = await replaceProductPromoCodes({
    userId,
    productId: String(req.params.productId),
    promoCodes: req.body.promoCodes,
  });
  return successRes(res, data);
};

export const activateProductPromoCodeController = async (req, res) => {
  const userId = String(req.userId ?? "");
  if (!userId) {
    return errorRes(res, 401, "Не авторизован");
  }
  const data = await activateProductPromoCode({
    userId,
    productId: String(req.params.productId),
    code: req.body.code,
  });
  return successRes(res, data);
};

export const listMyAppliedProductPromosController = async (req, res) => {
  const userId = String(req.userId ?? "");
  if (!userId) {
    return errorRes(res, 401, "Не авторизован");
  }
  const appliedPromos = await listAppliedProductPromosForUser({ userId });
  return successRes(res, { appliedPromos });
};
