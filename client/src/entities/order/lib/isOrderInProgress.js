import {
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_CONFIRMED,
} from "../model/constants.js";

/**
 * @param {import("../model/types.js").Order} order
 */
export function isOrderInProgress(order) {
  if (order.status === ORDER_STATUS_CANCELLED) {
    return false;
  }

  return (order.items ?? []).some(
    (item) =>
      item.status !== ORDER_STATUS_CONFIRMED && item.status !== ORDER_STATUS_CANCELLED,
  );
}
