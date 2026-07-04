import { summarizeInstallmentContracts } from "./summarizeInstallmentContracts.js";
import { contractNeedsBuyerAttention } from "./contractNeedsBuyerAttention.js";

/**
 * @param {import("../model/types.js").InstallmentContractFromApi[]} contracts
 */
export function summarizeInstallmentBuyerContracts(contracts) {
  return summarizeInstallmentContracts(contracts, contractNeedsBuyerAttention);
}
