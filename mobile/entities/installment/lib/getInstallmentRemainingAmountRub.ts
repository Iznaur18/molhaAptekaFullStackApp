import type { InstallmentContract } from "@/entities/installment/api/installmentApi";

export const getInstallmentRemainingAmountRub = (contract: InstallmentContract) =>
  Math.max(
    0,
    (Number(contract.totalAmountRub) || 0) - (Number(contract.paidAmountRub) || 0),
  );
