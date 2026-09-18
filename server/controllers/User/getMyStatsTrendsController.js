import { successRes } from "../../services/http/index.js";
import { getMyStatsTrends } from "../../services/user/getMyStatsTrends.js";

/**
 * `GET /user/me/stats-trends` — тренды подписчиков и продаж за 24ч.
 */
export const getMyStatsTrendsController = async (req, res) => {
  const data = await getMyStatsTrends(String(req.userId));
  return successRes(res, data);
};
