import type { InstallmentPayment } from "@/entities/installment/api/installmentApi";

type PaymentStatuses = {
  due: string;
  overdue: string;
  pendingConfirmation: string;
  paid: string;
};

export const partitionInstallmentContractPayments = (
  payments: InstallmentPayment[] = [],
  paymentStatuses: PaymentStatuses,
) => {
  const focus: InstallmentPayment[] = [];
  const upcoming: InstallmentPayment[] = [];
  const history: InstallmentPayment[] = [];

  for (const payment of payments) {
    const { status } = payment;

    if (status === paymentStatuses.paid) {
      history.push(payment);
      continue;
    }

    if (
      status === paymentStatuses.due ||
      status === paymentStatuses.overdue ||
      status === paymentStatuses.pendingConfirmation
    ) {
      focus.push(payment);
      continue;
    }

    upcoming.push(payment);
  }

  return { focus, upcoming, history };
};
