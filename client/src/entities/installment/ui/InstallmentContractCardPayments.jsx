import { partitionInstallmentContractPayments } from "../lib/partitionInstallmentContractPayments.js";
import { INSTALLMENT_UI } from "../../../shared/config/appUiCopy.js";
import { InstallmentContractCardPaymentRow } from "./InstallmentContractCardPaymentRow.jsx";

/**
 * @param {{
 *   contract: import("../model/types.js").InstallmentContractFromApi;
 *   role: "buyer" | "seller";
 *   compact?: boolean;
 *   paymentStatusLabels: Record<string, string>;
 *   paymentStatuses: {
 *     due: string;
 *     overdue: string;
 *     pendingConfirmation: string;
 *     paid: string;
 *   };
 *   isActiveContract: boolean;
 *   earlyPayoffPending: boolean;
 *   pendingKey: string | null;
 *   canBuyerMarkPayment: (
 *     contract: import("../model/types.js").InstallmentContractFromApi,
 *     payment: import("../model/types.js").InstallmentPaymentFromApi,
 *   ) => boolean;
 *   onMarkPaid: (paymentIndex: number) => void;
 *   onConfirmPayment: (paymentIndex: number) => void;
 *   onRejectPayment: (paymentIndex: number) => void;
 * }} props
 */
export function InstallmentContractCardPayments({
  contract,
  role,
  compact = false,
  paymentStatusLabels,
  paymentStatuses,
  isActiveContract,
  earlyPayoffPending,
  pendingKey,
  canBuyerMarkPayment,
  onMarkPaid,
  onConfirmPayment,
  onRejectPayment,
}) {
  const { focus, upcoming, history } = partitionInstallmentContractPayments(
    contract.payments,
    paymentStatuses,
  );

  const renderRow = (payment) => (
    <InstallmentContractCardPaymentRow
      key={`${payment.paymentIndex}-${payment._id ?? "p"}`}
      payment={payment}
      paymentLabel={paymentStatusLabels[payment.status] ?? payment.status}
      paymentStatuses={paymentStatuses}
      role={role}
      isActiveContract={isActiveContract}
      earlyPayoffPending={earlyPayoffPending}
      pendingKey={pendingKey}
      contract={contract}
      canBuyerMarkPayment={canBuyerMarkPayment}
      onMarkPaid={onMarkPaid}
      onConfirmPayment={onConfirmPayment}
      onRejectPayment={onRejectPayment}
      compact={compact}
    />
  );

  if (!compact) {
    return (
      <section className="installment-contract-card__payments">
        <h4 className="installment-contract-card__payments-title">
          {INSTALLMENT_UI.PAYMENTS_HEADING}
        </h4>
        {contract.payments.map(renderRow)}
      </section>
    );
  }

  return (
    <section className="installment-contract-card__payments installment-contract-card__payments_compact">
      {focus.length > 0 ? (
        <div className="installment-contract-card__payments-focus">
          <h4 className="installment-contract-card__payments-title">
            {INSTALLMENT_UI.PAYMENTS_FOCUS_HEADING}
          </h4>
          {focus.map(renderRow)}
        </div>
      ) : null}

      {upcoming.length > 0 ? (
        <details className="installment-contract-card__payments-fold">
          <summary className="installment-contract-card__payments-fold-summary">
            {INSTALLMENT_UI.PAYMENTS_UPCOMING_SUMMARY(upcoming.length)}
          </summary>
          <div className="installment-contract-card__payments-fold-body">
            {upcoming.map(renderRow)}
          </div>
        </details>
      ) : null}

      {history.length > 0 ? (
        <details className="installment-contract-card__payments-fold">
          <summary className="installment-contract-card__payments-fold-summary">
            {INSTALLMENT_UI.PAYMENTS_HISTORY_SUMMARY(history.length)}
          </summary>
          <div className="installment-contract-card__payments-fold-body">
            {history.map(renderRow)}
          </div>
        </details>
      ) : null}

      {focus.length === 0 && upcoming.length === 0 && history.length === 0 ? (
        <p className="installment-contract-card__payments-empty">
          {INSTALLMENT_UI.PAYMENTS_HEADING}
        </p>
      ) : null}
    </section>
  );
}
