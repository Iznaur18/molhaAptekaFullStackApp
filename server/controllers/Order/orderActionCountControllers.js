import { successRes } from "../../services/http/index.js";
import {
  countMyOrdersActionItems,
  countMySalesActionItems,
} from "../../services/order/orderActionCounts.js";

/** `GET /order/action-count` */
export const getMyOrdersActionCountController = async (req, res) => {
const count = await countMyOrdersActionItems(req.userId);
    return successRes(res, { count });
};

/** `GET /order/sales/action-count` */
export const getMySalesActionCountController = async (req, res) => {
const count = await countMySalesActionItems(req.userId);
    return successRes(res, { count });
};
