import {
  INSTALLMENT_PAYMENT_STATUS_DUE,
  INSTALLMENT_PAYMENT_STATUS_OVERDUE,
  INSTALLMENT_PAYMENT_STATUS_PAID,
  INSTALLMENT_PAYMENT_STATUS_SCHEDULED,
} from "../model/constants.js";

/**
 * @param {import("../model/types.js").InstallmentContractFromApi} contract
 */
export function getNextUnpaidInstallmentPayment(contract) {
  const unpaid = (contract.payments ?? [])
    .filter((payment) => payment.status !== INSTALLMENT_PAYMENT_STATUS_PAID)
    .sort((left, right) => left.paymentIndex - right.paymentIndex);
  return unpaid[0] ?? null;
}

/**
 * @param {import("../model/types.js").InstallmentContractFromApi} contract
 * @param {import("../model/types.js").InstallmentContractFromApi["payments"][number]} payment
 */
export function canBuyerMarkInstallmentPayment(contract, payment) {
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
}
