import { randomBytes } from "node:crypto";

import { INSTALLMENT_IDEMPOTENCY_KEY_MAX_LENGTH } from "../../constants/installmentConstants.js";
import { InstallmentOperationLogModel } from "../../models/index.js";
import { buildInstallmentContractPayload } from "./installmentHelpers.js";
import { loadInstallmentContractOrThrow } from "./installmentContractHelpers.js";

/**
 * @param {{
 *   action: string;
 *   contractId: string;
 *   actorUserId: string;
 *   paymentIndex?: number | null;
 *   idempotencyKey?: string | null;
 * }} input
 */
export const buildInstallmentOperationSourceId = ({
  action,
  contractId,
  actorUserId,
  paymentIndex = null,
  idempotencyKey = null,
}) => {
  const key = String(idempotencyKey ?? "").trim();
  const paymentPart =
    paymentIndex == null || !Number.isFinite(Number(paymentIndex))
      ? "na"
      : String(Number(paymentIndex));
  if (key) {
    return `installment:${action}:${contractId}:${paymentPart}:${actorUserId}:${key}`;
  }
  return `installment:${action}:${contractId}:${paymentPart}:${actorUserId}:${Date.now()}:${randomBytes(4).toString("hex")}`;
};

/**
 * @param {string} contractId
 * @param {string} [message]
 */
export const reloadInstallmentMutationResult = async (
  contractId,
  message = "Операция уже выполнена",
) => {
  const contract = await loadInstallmentContractOrThrow(contractId);
  return {
    message,
    contract: await buildInstallmentContractPayload(contract),
    duplicate: true,
  };
};

/**
 * Идемпотентная обёртка: при повторном ключе возвращает текущий контракт.
 * Денежную гонку закрывает CAS внутри `execute` (findOneAndUpdate по status).
 *
 * @param {{
 *   actorUserId: string;
 *   contractId: string;
 *   action: string;
 *   paymentIndex?: number | null;
 *   idempotencyKey?: string | null;
 *   successMessage: string;
 *   execute: () => Promise<{ message: string; contract: unknown; [key: string]: unknown }>;
 * }} input
 */
export async function runInstallmentIdempotentMutation({
  actorUserId,
  contractId,
  action,
  paymentIndex = null,
  idempotencyKey = null,
  successMessage,
  execute,
}) {
  const clientKey = String(idempotencyKey ?? "")
    .trim()
    .slice(0, INSTALLMENT_IDEMPOTENCY_KEY_MAX_LENGTH);
  const sourceId = buildInstallmentOperationSourceId({
    action,
    contractId,
    actorUserId,
    paymentIndex,
    idempotencyKey: clientKey || null,
  });

  if (clientKey) {
    const existing = await InstallmentOperationLogModel.findOne({ sourceId })
      .select("_id")
      .lean();
    if (existing) {
      return reloadInstallmentMutationResult(contractId, successMessage);
    }
  }

  const result = await execute();

  try {
    await InstallmentOperationLogModel.create({
      actorUserId,
      contractId,
      action,
      paymentIndex:
        paymentIndex == null || !Number.isFinite(Number(paymentIndex))
          ? null
          : Number(paymentIndex),
      idempotencyKey:
        clientKey || sourceId.slice(-INSTALLMENT_IDEMPOTENCY_KEY_MAX_LENGTH),
      sourceId,
      message: String(result?.message ?? successMessage),
    });
  } catch (error) {
    if (error?.code === 11000 && clientKey) {
      return reloadInstallmentMutationResult(contractId, successMessage);
    }
    throw error;
  }

  return result;
}
