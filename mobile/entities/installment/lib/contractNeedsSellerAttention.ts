import type { InstallmentContract } from "@/entities/installment/api/installmentApi";
import { isEarlyPayoffPendingConfirmation } from "@/entities/installment/lib/isEarlyPayoffPendingConfirmation";

export const contractNeedsSellerAttention = (contract: InstallmentContract): boolean => {
  const isActive = contract.status === "active" || contract.status === "pending_first_payment";

  if (!isActive) {
    return false;
  }

  if (isEarlyPayoffPendingConfirmation(contract)) {
    return true;
  }

  if (contract.hasOverduePayment) {
    return true;
  }

  return (contract.payments ?? []).some(
    (payment) => payment.status === "pending_confirmation",
  );
};
