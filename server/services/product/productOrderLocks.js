import {
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_PENDING,
} from "../../constants/orderConstants.js";
import { OrderModel } from "../../models/index.js";

const SALE_CLOSED_ITEM_STATUSES = new Set([
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_CANCELLED,
]);

const OPEN_SALES_BLOCK_MESSAGE =
  "Нельзя скрыть или удалить: есть заказы без подтверждения покупателем";

/**
 * @param {unknown} status
 */
const isOpenSaleItemStatus = (status) => {
  const normalized =
    typeof status === "string" && status.trim() !== ""
      ? status.trim()
      : ORDER_STATUS_PENDING;
  return !SALE_CLOSED_ITEM_STATUSES.has(normalized);
};

/**
 * @param {string} productId
 * @returns {Promise<boolean>}
 */
export async function hasProductOpenSales(productId) {
  const openIds = await getProductIdsWithOpenSales([String(productId)]);
  return openIds.has(String(productId));
}

export { OPEN_SALES_BLOCK_MESSAGE };

/**
 * @param {string[]} productIds
 * @returns {Promise<Set<string>>} id товаров с незавершёнными продажами
 */
export async function getProductIdsWithOpenSales(productIds) {
  const uniqueIds = [...new Set(productIds.map(String).filter(Boolean))];
  const openIds = new Set();
  if (uniqueIds.length === 0) return openIds;

  const orders = await OrderModel.find({
    "items.productId": { $in: uniqueIds },
  })
    .select("items.productId items.status")
    .lean();

  const allowed = new Set(uniqueIds);
  for (const order of orders) {
    for (const item of order.items ?? []) {
      const pid = String(item.productId ?? "");
      if (!allowed.has(pid)) continue;
      if (isOpenSaleItemStatus(item.status)) {
        openIds.add(pid);
      }
    }
  }
  return openIds;
}
