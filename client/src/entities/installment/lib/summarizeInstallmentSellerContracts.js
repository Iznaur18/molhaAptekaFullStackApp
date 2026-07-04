import { summarizeInstallmentContracts } from "./summarizeInstallmentContracts.js";
import { contractNeedsSellerAttention } from "./contractNeedsSellerAttention.js";

/**
 * @param {import("../model/types.js").InstallmentContractFromApi[]} contracts
 */
export function summarizeInstallmentSellerContracts(contracts) {
  return summarizeInstallmentContracts(contracts, contractNeedsSellerAttention);
}
