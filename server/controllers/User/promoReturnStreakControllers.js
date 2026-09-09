import {
  claimPromoReturnStreakDay,
  getPromoReturnStreakForUser,
} from "../../services/promo-return-streak/index.js";
import { successRes } from "../../services/http/index.js";

export const getMyPromoReturnStreakController = async (req, res) => {
  const streak = await getPromoReturnStreakForUser(String(req.userId));
  return successRes(res, { streak });
};

export const claimMyPromoReturnStreakController = async (req, res) => {
  const streak = await claimPromoReturnStreakDay(String(req.userId));
  return successRes(res, {
    message: `Скидка дня ${streak.day}: −${streak.discountPercent}%`,
    streak,
  });
};
