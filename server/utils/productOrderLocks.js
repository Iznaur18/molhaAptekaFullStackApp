import {
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_DELIVERED,
} from "../constants/orderConstants.js";
import { OrderModel } from "../models/index.js";

/** Любой заказ с этой позицией — правки карточки запрещены. */
export async function isProductReferencedInAnyOrder(productId) {
  const hit = await OrderModel.exists({
    "items.productId": productId,
  }).lean();
  return Boolean(hit);
}

/** Заказ не отменён и не доставлен — удаление товара запрещено. */
export async function isProductReferencedInActiveOrder(productId) {
  const hit = await OrderModel.exists({
    "items.productId": productId,
    status: { $nin: [ORDER_STATUS_CANCELLED, ORDER_STATUS_DELIVERED] },
  }).lean();
  return Boolean(hit);
}
