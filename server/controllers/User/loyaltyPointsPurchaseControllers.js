import { successRes } from "../../services/http/index.js";
import {
  adminCreditOwnLoyaltyPoints,
  getMyLoyaltyPointsStatus,
} from "../../services/loyalty/adminCreditOwnLoyaltyPoints.js";

export const getMyLoyaltyPointsStatusController = async (req, res) => {
  const data = await getMyLoyaltyPointsStatus({
    userId: String(req.userId),
  });
  return successRes(res, data);
};

export const adminCreditOwnLoyaltyPointsController = async (req, res) => {
  const result = await adminCreditOwnLoyaltyPoints({
    userId: String(req.userId),
    amount: req.body.amount,
    idempotencyKey: req.body.idempotencyKey,
  });

  return successRes(res, {
    message: result.duplicate ? "Баллы уже начислены" : "Баллы начислены",
    loyaltyPointsBalance: result.loyaltyPointsBalance,
    credited: result.credited,
    duplicate: Boolean(result.duplicate),
  });
};
