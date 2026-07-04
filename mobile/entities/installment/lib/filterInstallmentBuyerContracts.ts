import type { InstallmentContract } from "@/entities/installment/api/installmentApi";
import { contractNeedsBuyerAttention } from "@/entities/installment/lib/contractNeedsBuyerAttention";
import { filterInstallmentContracts } from "@/entities/installment/lib/filterInstallmentContracts";

type FilterInstallmentBuyerContractsParams = {
  status?: string;
  attentionOnly?: boolean;
};

export const filterInstallmentBuyerContracts = (
  contracts: InstallmentContract[],
  filters: FilterInstallmentBuyerContractsParams,
) =>
  filterInstallmentContracts(contracts, {
    ...filters,
    needsAttention: contractNeedsBuyerAttention,
  });
