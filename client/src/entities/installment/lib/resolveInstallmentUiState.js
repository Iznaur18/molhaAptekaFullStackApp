import { INSTALLMENT_MODERATION_APPROVED } from "../model/constants.js";

/**
 * @param {import("../../product/model/types.js").ProductFromApi | null | undefined} product
 * @param {import("../model/types.js").InstallmentProgramFromApi | null | undefined} program
 */
export function resolveInstallmentUiState(product, program) {
  const enabledOnProduct = product?.productInstallmentEnabled === true;
  const programApproved =
    program?.isEnabled === true &&
    program?.moderationStatus === INSTALLMENT_MODERATION_APPROVED &&
    (program?.plans?.length ?? 0) > 0;

  return {
    installmentActive: enabledOnProduct && programApproved,
    showInstallmentTab: programApproved || Boolean(program?.isEnabled),
    showInstallmentBadge: enabledOnProduct,
    program,
  };
}

/**
 * @param {import("../model/types.js").InstallmentContractFromApi} contract
 */
export function getInstallmentRemainingDays(contract) {
  const finalDue = new Date(contract.finalDueAt);
  const now = new Date();
  const diffMs = finalDue.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
}

/**
 * @param {import("../model/types.js").InstallmentContractFromApi} contract
 */
export function getInstallmentRemainingAmountRub(contract) {
  return Math.max(
    0,
    (Number(contract.totalAmountRub) || 0) -
      (Number(contract.paidAmountRub) || 0),
  );
}
