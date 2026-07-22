import { successRes } from "../../services/http/index.js";
import { getMonthlyLoyaltyPointsAwardedSummary } from "../../services/loyalty/sumMonthlyLoyaltyPointsAwarded.js";

export const getMonthlyLoyaltyPointsAwardedController = async (_req, res) => {
  const summary = await getMonthlyLoyaltyPointsAwardedSummary();
  return successRes(res, summary);
};
