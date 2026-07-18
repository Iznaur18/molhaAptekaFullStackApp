import { ORDER_STATUS_PENDING } from "../../constants/orderConstants.js";
import { OrderModel } from "../../models/index.js";
import { syncOrderStatusFromItems } from "../../services/order/orderStatus.js";
import { successRes } from "../../services/http/index.js";
import { sortByPriorityStatusFirst } from "../../utils/sortByPriorityStatusFirst.js";

import { ORDER_ITEMS_POPULATE } from "./orderQueries.js";

/** `GET /order` — список своих заказов (по `req.userId`), pending сверху, затем по дате. */
export const getMyOrdersController = async (req, res) => {
  const orders = await OrderModel.find({ userBuyerId: req.userId })
    .sort({ createdAt: -1 })
    .populate(ORDER_ITEMS_POPULATE)
    .lean();
  orders.forEach((order) => syncOrderStatusFromItems(order));

  const sortedOrders = sortByPriorityStatusFirst(orders, {
    priorityStatus: ORDER_STATUS_PENDING,
  });

  return successRes(res, { orders: sortedOrders });
};
