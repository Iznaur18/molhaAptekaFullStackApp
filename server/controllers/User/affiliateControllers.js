import { successRes } from "../../services/http/index.js";
import {
  getMyAffiliateEarnings,
  getMyAffiliateSales,
} from "../../services/affiliate/index.js";

export const getMyAffiliateSalesController = async (req, res) => {
  const data = await getMyAffiliateSales({ userId: String(req.userId) });
  return successRes(res, data);
};

export const getMyAffiliateEarningsController = async (req, res) => {
  const data = await getMyAffiliateEarnings(String(req.userId));
  return successRes(res, data);
};
