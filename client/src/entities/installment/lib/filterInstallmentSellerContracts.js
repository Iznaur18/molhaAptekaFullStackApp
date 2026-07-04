import { filterInstallmentContracts } from "./filterInstallmentContracts.js";
import { contractNeedsSellerAttention } from "./contractNeedsSellerAttention.js";

/**
 * @param {import("../model/types.js").InstallmentContractFromApi[]} contracts
 * @param {{ status?: string; attentionOnly?: boolean }} filters
 */
export function filterInstallmentSellerContracts(contracts, filters) {
  return filterInstallmentContracts(contracts, {
    ...filters,
    needsAttention: contractNeedsSellerAttention,
  });
}
