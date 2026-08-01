import { INSTALLMENT_CONTRACT_STATUS_PENDING_FIRST_PAYMENT } from "../../constants/installmentConstants.js";
import { InstallmentContractModel, OrderModel } from "../../models/index.js";
import { sortByPriorityStatusFirst } from "../../utils/sortByPriorityStatusFirst.js";
import { attachSellerBuyerPassportShareToContracts } from "../order/buyerPassportShare.js";
import {
  buildInstallmentContractPayloads,
  repairInstallmentPaymentStatusDrift,
  resolveInstallmentContractStatusQuery,
} from "./installmentHelpers.js";
import { isInstallmentContractVisibleInLists } from "./installmentOrderAcceptGate.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

/**
 * @param {{ page?: number; limit?: number }} [query]
 */
function parseListPagination(query = {}) {
  const page = Math.max(1, Number(query.page) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(query.limit) || DEFAULT_LIMIT));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/**
 * @param {{
 *   userId: string;
 *   statusFilter?: string;
 *   role: "buyer" | "seller";
 *   page?: number;
 *   limit?: number;
 * }} input
 */
export async function listInstallmentContracts({
  userId,
  statusFilter,
  role,
  page: pageInput,
  limit: limitInput,
}) {
  const { page, limit, skip } = parseListPagination({
    page: pageInput,
    limit: limitInput,
  });

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
      rows.map((row) => (row.orderId ? String(row.orderId) : "")).filter(Boolean),
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

  const total = orderedRows.length;
  const pageRows = orderedRows.slice(skip, skip + limit);

  const payloads = await buildInstallmentContractPayloads(pageRows);
  const payloadsWithOrderStatus = payloads.map((payload) => {
    const order = payload.orderId ? orderById.get(payload.orderId) : null;
    return {
      ...payload,
      orderStatus: order?.status ? String(order.status) : null,
    };
  });

  const contracts =
    role !== "seller"
      ? payloadsWithOrderStatus
      : await attachSellerBuyerPassportShareToContracts(
          payloadsWithOrderStatus,
          orderById,
        );

  return {
    contracts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
      hasMore: skip + limit < total,
    },
  };
}
