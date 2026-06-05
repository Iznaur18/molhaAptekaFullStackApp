import {
  INSTALLMENT_PAYMENT_STATUS_PAID,
  INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION,
} from "../model/constants.js";

/**
 * @param {import("../model/types.js").InstallmentContractFromApi} contract
 */
export function isEarlyPayoffPendingConfirmation(contract) {
  const unpaid = (contract.payments ?? []).filter(
    (payment) => payment.status !== INSTALLMENT_PAYMENT_STATUS_PAID,
  );
  const pending = unpaid.filter(
    (payment) => payment.status === INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION,
  );
  return pending.length > 0 && pending.length === unpaid.length;
}
