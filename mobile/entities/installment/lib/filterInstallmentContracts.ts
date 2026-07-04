import type { InstallmentContract } from "@/entities/installment/api/installmentApi";
import { INSTALLMENT_SALES_LIST_FILTER_IN_PROGRESS } from "@/entities/installment/model/constants";

type FilterInstallmentContractsParams = {
  status?: string;
  attentionOnly?: boolean;
  needsAttention?: (contract: InstallmentContract) => boolean;
};

export const filterInstallmentContracts = (
  contracts: InstallmentContract[],
  { status = "", attentionOnly = false, needsAttention = null }: FilterInstallmentContractsParams,
): InstallmentContract[] => {
  let result = contracts;

  if (status) {
    if (status === INSTALLMENT_SALES_LIST_FILTER_IN_PROGRESS) {
      result = result.filter(
        (contract) =>
          contract.status === "active" || contract.status === "pending_first_payment",
      );
    } else {
      result = result.filter((contract) => contract.status === status);
    }
  }

  if (attentionOnly && needsAttention) {
    result = result.filter(needsAttention);
  }

  return result;
};
