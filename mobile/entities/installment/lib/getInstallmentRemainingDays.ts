import type { InstallmentContract } from "@/entities/installment/api/installmentApi";

export const getInstallmentRemainingDays = (contract: InstallmentContract) => {
  if (!contract.finalDueAt) {
    return 0;
  }
  const finalDue = new Date(contract.finalDueAt);
  const now = new Date();
  const diffMs = finalDue.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
};
