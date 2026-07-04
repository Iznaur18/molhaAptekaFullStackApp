import { filterInstallmentContracts } from "./filterInstallmentContracts.js";
import { contractNeedsBuyerAttention } from "./contractNeedsBuyerAttention.js";

/**
 * @param {import("../model/types.js").InstallmentContractFromApi[]} contracts
 * @param {{ status?: string; attentionOnly?: boolean }} filters
 */
export function filterInstallmentBuyerContracts(contracts, filters) {
  return filterInstallmentContracts(contracts, {
    ...filters,
    needsAttention: contractNeedsBuyerAttention,
  });
}
