import type { InstallmentContract } from "@/entities/installment/api/installmentApi";
import {
  INSTALLMENT_PAYMENT_STATUS_PAID,
  INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION,
} from "@/entities/installment/model/constants";

export const isEarlyPayoffPendingConfirmation = (contract: InstallmentContract) => {
  const unpaid = (contract.payments ?? []).filter(
    (payment) => payment.status !== INSTALLMENT_PAYMENT_STATUS_PAID,
  );
  const pending = unpaid.filter(
    (payment) => payment.status === INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION,
  );
  return pending.length > 0 && pending.length === unpaid.length;
};
