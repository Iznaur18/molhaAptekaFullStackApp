import { OrderModel } from "../../models/index.js";
import { sanitizeOrderForBuyerApi } from "../../services/order/buyerPassportShare.js";
import { fetchMyOrdersPageIds } from "../../services/order/fetchMyOrdersPageIds.js";
import { orderRowsByIds } from "../../services/order/fetchMySalesOrderPageIds.js";
import { syncOrderStatusFromItems } from "../../services/order/orderStatus.js";
import { successRes } from "../../services/http/index.js";

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

  const { orderIds, total } = await fetchMyOrdersPageIds({
    buyerUserId: req.userId,
    skip,
    limit,
  });

  if (orderIds.length === 0) {
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

  const orders = await OrderModel.find({ _id: { $in: orderIds } })
    .populate(ORDER_ITEMS_POPULATE)
    .lean();

  const pageOrders = orderRowsByIds(orderIds, orders);
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
