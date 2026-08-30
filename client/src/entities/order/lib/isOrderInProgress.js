import {
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_RETURNED,
} from "../model/constants.js";

/**
 * @param {import("../model/types.js").Order} order
 */
export function isOrderInProgress(order) {
  if (
    order.status === ORDER_STATUS_CANCELLED ||
    order.status === ORDER_STATUS_RETURNED
  ) {
    return false;
  }

  return (order.items ?? []).some(
    (item) =>
      item.status !== ORDER_STATUS_CONFIRMED &&
      item.status !== ORDER_STATUS_CANCELLED &&
      item.status !== ORDER_STATUS_RETURNED,
  );
}
