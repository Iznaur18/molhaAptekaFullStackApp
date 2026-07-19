import {
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_SHIPPED,
} from "../../constants/orderConstants.js";
import {
  INSTALLMENT_CONTRACT_STATUS_CANCELLED,
  INSTALLMENT_CONTRACT_STATUS_COMPLETED,
} from "../../constants/installmentConstants.js";

/** Seller «Принять» = shipped; дальше delivered/confirmed тоже считаются принятыми. */
const SELLER_ACCEPTED_ORDER_STATUSES = new Set([
  ORDER_STATUS_SHIPPED,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_CONFIRMED,
]);

/**
 * @param {Record<string, unknown> | null | undefined} order
 * @returns {boolean}
 */
export const isInstallmentOrderAcceptedBySeller = (order) => {
  if (!order || order.status === ORDER_STATUS_CANCELLED) {
    return false;
  }
  if (SELLER_ACCEPTED_ORDER_STATUSES.has(String(order.status ?? ""))) {
    return true;
  }
  const items = Array.isArray(order.items) ? order.items : [];
  return items.some((item) =>
    SELLER_ACCEPTED_ORDER_STATUSES.has(String(item?.status ?? "")),
  );
};

/**
 * В списках рассрочки до «Принять» скрываем живые контракты.
 * cancelled/completed оставляем (история).
 *
 * @param {{ status?: string }} contract
 * @param {Record<string, unknown> | null | undefined} order
 */
export const isInstallmentContractVisibleInLists = (contract, order) => {
  const status = String(contract?.status ?? "");
  if (
    status === INSTALLMENT_CONTRACT_STATUS_CANCELLED ||
    status === INSTALLMENT_CONTRACT_STATUS_COMPLETED
  ) {
    return true;
  }
  return isInstallmentOrderAcceptedBySeller(order);
};
