export const INSTALLMENT_PAYMENT_STATUS_DUE = "due";
export const INSTALLMENT_PAYMENT_STATUS_OVERDUE = "overdue";
export const INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION = "pending_confirmation";
export const INSTALLMENT_PAYMENT_STATUS_PAID = "paid";

export const INSTALLMENT_CONTRACT_STATUS_FILTER_OPTIONS = [
  { value: "", labelKey: "CONTRACT_STATUS_FILTER_ALL" as const },
  { value: "in_progress", labelKey: "CONTRACT_STATUS_FILTER_IN_PROGRESS" as const },
  { value: "completed", labelKey: "CONTRACT_STATUS_FILTER_COMPLETED" as const },
  { value: "defaulted", labelKey: "CONTRACT_STATUS_FILTER_DEFAULTED" as const },
  { value: "cancelled", labelKey: "CONTRACT_STATUS_FILTER_CANCELLED" as const },
];
