import { OrderModel } from "../../models/index.js";
import { successRes } from "../../services/http/index.js";

import { ORDER_ITEMS_POPULATE } from "./orderQueries.js";
import { syncOrderStatusFromItems } from "../../services/order/orderStatus.js";

/** `GET /order` — список своих заказов (по `req.userId`), сортировка по дате. */
export const getMyOrdersController = async (req, res) => {
const orders = await OrderModel.find({ userBuyerId: req.userId })
      .sort({ createdAt: -1 })
      .populate(ORDER_ITEMS_POPULATE)
      .lean();
    orders.forEach((order) => syncOrderStatusFromItems(order));

    return successRes(res, { orders });
};
