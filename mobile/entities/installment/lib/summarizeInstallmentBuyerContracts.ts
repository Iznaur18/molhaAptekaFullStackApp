import type { InstallmentContract } from "@/entities/installment/api/installmentApi";
import { contractNeedsBuyerAttention } from "@/entities/installment/lib/contractNeedsBuyerAttention";
import { summarizeInstallmentContracts } from "@/entities/installment/lib/summarizeInstallmentContracts";

export const summarizeInstallmentBuyerContracts = (contracts: InstallmentContract[]) =>
  summarizeInstallmentContracts(contracts, contractNeedsBuyerAttention);
