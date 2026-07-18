import { INSTALLMENT_CONTRACT_STATUS_PENDING_FIRST_PAYMENT } from "../../constants/installmentConstants.js";
import { InstallmentContractModel } from "../../models/index.js";
import { sortByPriorityStatusFirst } from "../../utils/sortByPriorityStatusFirst.js";
import {
  buildInstallmentContractPayloads,
  repairInstallmentPaymentStatusDrift,
  resolveInstallmentContractStatusQuery,
} from "./installmentHelpers.js";

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

  const orderedRows = normalizedStatus
    ? rows
    : sortByPriorityStatusFirst(rows, {
        priorityStatus: INSTALLMENT_CONTRACT_STATUS_PENDING_FIRST_PAYMENT,
      });

  return buildInstallmentContractPayloads(orderedRows);
}
