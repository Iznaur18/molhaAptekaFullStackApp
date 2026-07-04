import type { InstallmentContract } from "@/entities/installment/api/installmentApi";
import { contractNeedsSellerAttention } from "@/entities/installment/lib/contractNeedsSellerAttention";
import { summarizeInstallmentContracts } from "@/entities/installment/lib/summarizeInstallmentContracts";

export const summarizeInstallmentSellerContracts = (contracts: InstallmentContract[]) =>
  summarizeInstallmentContracts(contracts, contractNeedsSellerAttention);
