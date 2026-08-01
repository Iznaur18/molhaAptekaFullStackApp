import { ORDER_STATUS_CONFIRMED, ORDER_STATUS_DELIVERED } from "./orderConstants.js";

/** Статусы позиции заказа, учитываемые в soldQuantity (синхрон с aggregate в orders). */
export const PRODUCT_SOLD_QUANTITY_COUNT_STATUSES = [
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_CONFIRMED,
];
