import { InstallmentContractModel } from "../../models/index.js";
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

  return buildInstallmentContractPayloads(rows);
}
