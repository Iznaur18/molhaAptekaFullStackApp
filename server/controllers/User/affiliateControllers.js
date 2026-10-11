import { errorRes, successRes } from "../../services/http/index.js";
import {
  getMyAffiliateEarnings,
  getMyAffiliateSales,
} from "../../services/affiliate/index.js";

export const getMyAffiliateSalesController = async (req, res) => {
  const data = await getMyAffiliateSales({ userId: String(req.userId) });
  return successRes(res, data);
};

export const getMyAffiliateEarningsController = async (req, res) => {
  const userId = String(req.userId);
  try {
    const data = await getMyAffiliateEarnings(userId);
    return successRes(res, data);
  } catch (error) {
    if (error instanceof Error && error.message === "USER_NOT_FOUND") {
      return errorRes(res, 404, "Пользователь не найден");
    }
    throw error;
  }
};
