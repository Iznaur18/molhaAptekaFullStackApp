import { UserModel } from "../../models/index.js";
import { errorRes, successRes } from "../../services/http/index.js";
import { adminCreditOwnLoyaltyPoints } from "../../services/loyalty/adminCreditOwnLoyaltyPoints.js";

export const getMyLoyaltyPointsStatusController = async (req, res) => {
  const userId = String(req.userId);
  const user = await UserModel.findById(userId)
    .select("userLoyaltyPoints userLoyaltyPointsReserved")
    .lean();

  if (!user) {
    return errorRes(res, 404, "Пользователь не найден");
  }

  return successRes(res, {
    loyaltyPointsBalance: Number(user.userLoyaltyPoints) || 0,
    loyaltyPointsReserved: Number(user.userLoyaltyPointsReserved) || 0,
  });
};

export const adminCreditOwnLoyaltyPointsController = async (req, res) => {
  const userId = String(req.userId);
  const amount = req.body.amount;
  const idempotencyKey = req.body.idempotencyKey;

  const result = await adminCreditOwnLoyaltyPoints({
    userId,
    amount,
    idempotencyKey,
  });

  return successRes(res, {
    message: result.duplicate ? "Баллы уже начислены" : "Баллы начислены",
    loyaltyPointsBalance: result.loyaltyPointsBalance,
    credited: result.credited,
    duplicate: Boolean(result.duplicate),
  });
};
