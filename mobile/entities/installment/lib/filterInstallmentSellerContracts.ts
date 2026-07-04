import type { InstallmentContract } from "@/entities/installment/api/installmentApi";
import { contractNeedsSellerAttention } from "@/entities/installment/lib/contractNeedsSellerAttention";
import { filterInstallmentContracts } from "@/entities/installment/lib/filterInstallmentContracts";

type FilterInstallmentSellerContractsParams = {
  status?: string;
  attentionOnly?: boolean;
};

export const filterInstallmentSellerContracts = (
  contracts: InstallmentContract[],
  filters: FilterInstallmentSellerContractsParams,
) =>
  filterInstallmentContracts(contracts, {
    ...filters,
    needsAttention: contractNeedsSellerAttention,
  });
