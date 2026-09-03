import {
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_PENDING,
  ORDER_TERMINAL_STATUSES,
} from "../../constants/orderConstants.js";
import { OrderModel } from "../../models/index.js";

/**
 * Позиции, которые товар уже не держат: покупатель подтвердил получение либо
 * сделка оборвалась терминально — отмена и возврат.
 *
 * `returned` сюда раньше не входил, хотя остаток он освобождает наравне с
 * отменой (ORDER_STOCK_RESERVING_STATUSES). Из-за этого отказ покупателя у
 * двери запирал товар навсегда: подтвердить такую позицию уже некому, и
 * продавец до конца жизни товара не мог ни скрыть его, ни удалить.
 */
const SALE_CLOSED_ITEM_STATUSES = [
  ORDER_STATUS_CONFIRMED,
  ...ORDER_TERMINAL_STATUSES,
];

const SALE_CLOSED_STATUS_SET = new Set(SALE_CLOSED_ITEM_STATUSES);

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
  return !SALE_CLOSED_STATUS_SET.has(normalized);
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
    items: {
      $elemMatch: {
        productId: { $in: uniqueIds },
        // missing/null status → open (как isOpenSaleItemStatus); $nin матчит отсутствие поля
        status: { $nin: SALE_CLOSED_ITEM_STATUSES },
      },
    },
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
