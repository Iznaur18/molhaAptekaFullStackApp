import {
  INSTALLMENT_CONTRACT_STATUS_ACTIVE,
  INSTALLMENT_CONTRACT_STATUS_PENDING_FIRST_PAYMENT,
} from "../model/constants.js";
import { getInstallmentRemainingAmountRub } from "./resolveInstallmentUiState.js";

/**
 * @param {import("../model/types.js").InstallmentContractFromApi[]} contracts
 * @param {(contract: import("../model/types.js").InstallmentContractFromApi) => boolean} needsAttention
 */
export function summarizeInstallmentContracts(contracts, needsAttention) {
  let activeCount = 0;
  let attentionCount = 0;
  let totalRemainingRub = 0;

  for (const contract of contracts) {
    totalRemainingRub += getInstallmentRemainingAmountRub(contract);

    const isActive =
      contract.status === INSTALLMENT_CONTRACT_STATUS_ACTIVE ||
      contract.status === INSTALLMENT_CONTRACT_STATUS_PENDING_FIRST_PAYMENT;

    if (isActive) {
      activeCount += 1;
    }

    if (needsAttention(contract)) {
      attentionCount += 1;
    }
  }

  return { activeCount, attentionCount, totalRemainingRub };
}
