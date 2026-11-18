import { successRes } from "../../services/http/index.js";
import {
  getMyPremiumStatus,
  purchasePremium,
} from "../../services/user/premiumAccess.js";

export const getMyPremiumStatusController = async (req, res) => {
  const data = await getMyPremiumStatus({
    userId: String(req.userId),
  });
  return successRes(res, data);
};

export const purchasePremiumController = async (req, res) => {
  const data = await purchasePremium({
    userId: String(req.userId),
    idempotencyKey: req.body.idempotencyKey,
  });
  return successRes(res, data);
};
