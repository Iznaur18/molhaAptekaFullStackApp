import type {
  InstallmentContract,
  InstallmentPayment,
} from "@/entities/installment/api/installmentApi";
import {
  INSTALLMENT_PAYMENT_STATUS_DUE,
  INSTALLMENT_PAYMENT_STATUS_OVERDUE,
  INSTALLMENT_PAYMENT_STATUS_PAID,
  INSTALLMENT_PAYMENT_STATUS_SCHEDULED,
} from "@/entities/installment/model/constants";

const getNextUnpaidInstallmentPayment = (contract: InstallmentContract) => {
  const unpaid = (contract.payments ?? [])
    .filter((payment) => payment.status !== INSTALLMENT_PAYMENT_STATUS_PAID)
    .sort((left, right) => left.paymentIndex - right.paymentIndex);
  return unpaid[0] ?? null;
};

export const canBuyerMarkInstallmentPayment = (
  contract: InstallmentContract,
  payment: InstallmentPayment,
) => {
  if (
    payment.status === INSTALLMENT_PAYMENT_STATUS_DUE ||
    payment.status === INSTALLMENT_PAYMENT_STATUS_OVERDUE
  ) {
    return true;
  }
  if (payment.status !== INSTALLMENT_PAYMENT_STATUS_SCHEDULED) {
    return false;
  }
  const nextPayment = getNextUnpaidInstallmentPayment(contract);
  return nextPayment?.paymentIndex === payment.paymentIndex;
};
