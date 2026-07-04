import type { InstallmentContract } from "@/entities/installment/api/installmentApi";
import { canBuyerMarkInstallmentPayment } from "@/entities/installment/lib/canBuyerMarkInstallmentPayment";
import { isEarlyPayoffPendingConfirmation } from "@/entities/installment/lib/isEarlyPayoffPendingConfirmation";

export const contractNeedsBuyerAttention = (contract: InstallmentContract): boolean => {
  const isActive = contract.status === "active" || contract.status === "pending_first_payment";

  if (!isActive) {
    return false;
  }

  if (contract.hasOverduePayment) {
    return true;
  }

  if (isEarlyPayoffPendingConfirmation(contract)) {
    return true;
  }

  return (contract.payments ?? []).some((payment) =>
    canBuyerMarkInstallmentPayment(contract, payment),
  );
};
