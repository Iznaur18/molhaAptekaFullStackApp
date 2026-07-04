import {
  INSTALLMENT_CONTRACT_STATUS_ACTIVE,
  INSTALLMENT_CONTRACT_STATUS_PENDING_FIRST_PAYMENT,
} from "../model/constants.js";
import { canBuyerMarkInstallmentPayment } from "./canBuyerMarkInstallmentPayment.js";
import { isEarlyPayoffPendingConfirmation } from "./isEarlyPayoffPendingConfirmation.js";

/**
 * @param {import("../model/types.js").InstallmentContractFromApi} contract
 */
export function contractNeedsBuyerAttention(contract) {
  const isActive =
    contract.status === INSTALLMENT_CONTRACT_STATUS_ACTIVE ||
    contract.status === INSTALLMENT_CONTRACT_STATUS_PENDING_FIRST_PAYMENT;

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
}
