import type { InstallmentContract } from "@/entities/installment/api/installmentApi";
import { getInstallmentRemainingAmountRub } from "@/entities/installment/lib/getInstallmentRemainingAmountRub";

export const summarizeInstallmentContracts = (
  contracts: InstallmentContract[],
  needsAttention: (contract: InstallmentContract) => boolean,
) => {
  let activeCount = 0;
  let attentionCount = 0;
  let totalRemainingRub = 0;

  for (const contract of contracts) {
    totalRemainingRub += getInstallmentRemainingAmountRub(contract);

    const isActive =
      contract.status === "active" || contract.status === "pending_first_payment";

    if (isActive) {
      activeCount += 1;
    }

    if (needsAttention(contract)) {
      attentionCount += 1;
    }
  }

  return { activeCount, attentionCount, totalRemainingRub };
};
