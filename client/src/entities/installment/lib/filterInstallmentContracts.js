import {
  INSTALLMENT_CONTRACT_STATUS_ACTIVE,
  INSTALLMENT_CONTRACT_STATUS_PENDING_FIRST_PAYMENT,
  INSTALLMENT_SALES_LIST_FILTER_IN_PROGRESS,
} from "../model/constants.js";

/**
 * @param {import("../model/types.js").InstallmentContractFromApi[]} contracts
 * @param {{
 *   status?: string;
 *   attentionOnly?: boolean;
 *   needsAttention?: (contract: import("../model/types.js").InstallmentContractFromApi) => boolean;
 * }} filters
 */
export function filterInstallmentContracts(
  contracts,
  { status = "", attentionOnly = false, needsAttention = null },
) {
  let result = contracts;

  if (status) {
    if (status === INSTALLMENT_SALES_LIST_FILTER_IN_PROGRESS) {
      result = result.filter(
        (contract) =>
          contract.status === INSTALLMENT_CONTRACT_STATUS_ACTIVE ||
          contract.status === INSTALLMENT_CONTRACT_STATUS_PENDING_FIRST_PAYMENT,
      );
    } else {
      result = result.filter((contract) => contract.status === status);
    }
  }

  if (attentionOnly && typeof needsAttention === "function") {
    result = result.filter(needsAttention);
  }

  return result;
}
