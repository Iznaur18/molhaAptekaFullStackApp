import { OrderModel } from "../../models/index.js";
import { AppError } from "../../errors/AppError.js";
import {
  ORDER_BUYER_PUBLIC_FIELDS,
  ORDER_ITEMS_POPULATE,
  ORDER_AFFILIATE_REFERRER_POPULATE,
} from "../order/orderQueries.js";
import {
  normalizeOrderDocumentForRuntime,
  normalizeOrderItemsForRuntime,
} from "./orderStatus.js";

export const parseItemIndex = (raw) => Number(raw);

export const normalizeId = (value) => String(value ?? "");

export const getOrderItemByIndex = (order, itemIndex) =>
  itemIndex >= 0 && itemIndex < order.items.length ? order.items[itemIndex] : null;

/**
 * @param {import('mongoose').Document | Record<string, unknown>} order
 */
export const populateOrderForResponse = async (order) => {
  await order.populate("userBuyerId", ORDER_BUYER_PUBLIC_FIELDS);
  await order.populate(ORDER_ITEMS_POPULATE);
  await order.populate(ORDER_AFFILIATE_REFERRER_POPULATE);
  return order;
};

/**
 * `session` обязателен, когда документ мутируется внутри транзакции:
 * `withTransaction` ретраит колбэк при WriteConflict, а mongoose после
 * `save()` считает документ чистым — повторный проход по документу,
 * загруженному СНАРУЖИ, не запишет ничего (мутации теряются молча).
 * Значит документ надо перечитывать на каждой попытке.
 *
 * @param {string} orderId
 * @param {import('mongoose').ClientSession | null} [session]
 */
export const loadOrderWithItems = async (orderId, session = null) => {
  const query = OrderModel.findById(orderId).populate(ORDER_ITEMS_POPULATE);
  if (session) {
    query.session(session);
  }
  const order = await query;
  if (!order) {
    throw new AppError(404, "Заказ не найден");
  }
  normalizeOrderDocumentForRuntime(order);
  normalizeOrderItemsForRuntime(order.items);
  return order;
};

/**
 * @param {import('mongoose').Document} order
 * @param {number} itemIndex
 */
export const getPopulatedOrderItemOrThrow = (order, itemIndex) => {
  const targetItem = getOrderItemByIndex(order, itemIndex);
  if (!targetItem) {
    throw new AppError(404, "Позиция заказа не найдена");
  }
  if (!targetItem.productId || typeof targetItem.productId === "string") {
    throw new AppError(400, "Товар позиции не найден");
  }
  return targetItem;
};

/**
 * @param {import('mongoose').Document} targetItem
 * @param {string} sellerId
 */
export const assertSellerOwnsOrderItem = (targetItem, sellerId) => {
  const itemSellerId = normalizeId(
    targetItem.productId.productSeller?._id ?? targetItem.productId.productSeller,
  );
  if (itemSellerId !== sellerId) {
    throw new AppError(403, "Можно обновлять только свои продажи");
  }
};

/**
 * @param {unknown} productIdField
 */
export const resolveProductIdFromItem = (productIdField) => {
  if (!productIdField) return null;
  return typeof productIdField === "object" ? productIdField._id : productIdField;
};

/**
 * @param {string} orderId
 */
export const reloadOrderWithItems = async (orderId) => {
  const order = await OrderModel.findById(orderId).populate(ORDER_ITEMS_POPULATE);
  if (!order) {
    throw new AppError(404, "Заказ не найден");
  }
  normalizeOrderDocumentForRuntime(order);
  normalizeOrderItemsForRuntime(order.items);
  await populateOrderForResponse(order);
  return order;
};
