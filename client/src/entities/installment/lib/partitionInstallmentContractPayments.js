/**
 * @param {import("../model/types.js").InstallmentPaymentFromApi[]} payments
 * @param {{
 *   due: string;
 *   overdue: string;
 *   pendingConfirmation: string;
 *   paid: string;
 * }} paymentStatuses
 */
export function partitionInstallmentContractPayments(payments, paymentStatuses) {
  const focus = [];
  const upcoming = [];
  const history = [];

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
}
