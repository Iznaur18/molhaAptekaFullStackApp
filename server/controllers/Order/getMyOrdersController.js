import { ORDER_STATUS_PENDING } from "../../constants/orderConstants.js";
import { OrderModel } from "../../models/index.js";
import { sanitizeOrderForBuyerApi } from "../../services/order/buyerPassportShare.js";
import { syncOrderStatusFromItems } from "../../services/order/orderStatus.js";
import { successRes } from "../../services/http/index.js";
import { sortByPriorityStatusFirst } from "../../utils/sortByPriorityStatusFirst.js";

import { ORDER_ITEMS_POPULATE } from "./orderQueries.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

const parsePagination = (query) => {
  const page = Math.max(1, Number(query.page) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(query.limit) || DEFAULT_LIMIT));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/** `GET /order` — список своих заказов (по `req.userId`), pending сверху, затем по дате. */
export const getMyOrdersController = async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);

  const lightOrders = await OrderModel.find({ userBuyerId: req.userId })
    .select("status createdAt items.status")
    .sort({ createdAt: -1 })
    .lean();

  lightOrders.forEach((order) => syncOrderStatusFromItems(order));

  const sortedLight = sortByPriorityStatusFirst(lightOrders, {
    priorityStatus: ORDER_STATUS_PENDING,
  });
  const total = sortedLight.length;
  const pageIds = sortedLight.slice(skip, skip + limit).map((order) => order._id);

  if (pageIds.length === 0) {
    return successRes(res, {
      orders: [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 0,
        hasMore: skip + limit < total,
      },
    });
  }

  const orders = await OrderModel.find({ _id: { $in: pageIds } })
    .populate(ORDER_ITEMS_POPULATE)
    .lean();

  const byId = new Map(orders.map((order) => [String(order._id), order]));
  const pageOrders = pageIds
    .map((id) => byId.get(String(id)))
    .filter(Boolean);

  pageOrders.forEach((order) => syncOrderStatusFromItems(order));

  const sortedOrders = pageOrders.map((order) => sanitizeOrderForBuyerApi(order));

  return successRes(res, {
    orders: sortedOrders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
      hasMore: skip + limit < total,
    },
  });
};
