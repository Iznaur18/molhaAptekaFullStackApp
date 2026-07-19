import { INSTALLMENT_CONTRACT_STATUS_PENDING_FIRST_PAYMENT } from "../../constants/installmentConstants.js";
import { InstallmentContractModel, OrderModel } from "../../models/index.js";
import { sortByPriorityStatusFirst } from "../../utils/sortByPriorityStatusFirst.js";
import {
  attachSellerBuyerPassportShareToContracts,
} from "../order/buyerPassportShare.js";
import {
  buildInstallmentContractPayloads,
  repairInstallmentPaymentStatusDrift,
  resolveInstallmentContractStatusQuery,
} from "./installmentHelpers.js";
import { isInstallmentContractVisibleInLists } from "./installmentOrderAcceptGate.js";

/**
 * @param {{
 *   userId: string;
 *   statusFilter?: string;
 *   role: "buyer" | "seller";
 * }} input
 */
export async function listInstallmentContracts({ userId, statusFilter, role }) {
  const normalizedStatus =
    typeof statusFilter === "string" && statusFilter.trim() !== ""
      ? statusFilter.trim()
      : undefined;

  const userField = role === "buyer" ? "buyerUserId" : "sellerUserId";
  const rows = await InstallmentContractModel.find({
    [userField]: userId,
    ...resolveInstallmentContractStatusQuery(normalizedStatus),
  }).sort({ createdAt: -1 });

  for (const row of rows) {
    await repairInstallmentPaymentStatusDrift(row);
  }

  const orderIds = [
    ...new Set(
      rows
        .map((row) => (row.orderId ? String(row.orderId) : ""))
        .filter(Boolean),
    ),
  ];
  const orders =
    orderIds.length > 0
      ? await OrderModel.find({ _id: { $in: orderIds } })
          .select("buyerPassportShare passportShareConsentAt status items.status")
          .lean()
      : [];
  const orderById = new Map(orders.map((order) => [String(order._id), order]));

  const visibleRows = rows.filter((row) => {
    const orderId = row.orderId ? String(row.orderId) : "";
    const order = orderId ? orderById.get(orderId) : null;
    return isInstallmentContractVisibleInLists(row, order);
  });

  const orderedRows = normalizedStatus
    ? visibleRows
    : sortByPriorityStatusFirst(visibleRows, {
        priorityStatus: INSTALLMENT_CONTRACT_STATUS_PENDING_FIRST_PAYMENT,
      });

  const payloads = await buildInstallmentContractPayloads(orderedRows);
  const payloadsWithOrderStatus = payloads.map((payload) => {
    const order = payload.orderId ? orderById.get(payload.orderId) : null;
    return {
      ...payload,
      orderStatus: order?.status ? String(order.status) : null,
    };
  });

  if (role !== "seller") {
    return payloadsWithOrderStatus;
  }

  return attachSellerBuyerPassportShareToContracts(
    payloadsWithOrderStatus,
    orderById,
  );
}
