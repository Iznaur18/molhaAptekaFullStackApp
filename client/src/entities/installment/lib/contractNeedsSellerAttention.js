import {
  INSTALLMENT_CONTRACT_STATUS_ACTIVE,
  INSTALLMENT_CONTRACT_STATUS_PENDING_FIRST_PAYMENT,
  INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION,
} from "../model/constants.js";
import { isEarlyPayoffPendingConfirmation } from "./isEarlyPayoffPendingConfirmation.js";

/**
 * @param {import("../model/types.js").InstallmentContractFromApi} contract
 */
export function contractNeedsSellerAttention(contract) {
  const isActive =
    contract.status === INSTALLMENT_CONTRACT_STATUS_ACTIVE ||
    contract.status === INSTALLMENT_CONTRACT_STATUS_PENDING_FIRST_PAYMENT;

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
    (payment) => payment.status === INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION,
  );
}
