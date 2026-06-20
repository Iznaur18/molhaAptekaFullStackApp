import { INSTALLMENT_UI } from "../../../shared/config/appUiCopy.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";

/**
 * @param {{
 *   payment: import("../model/types.js").InstallmentPaymentFromApi;
 *   paymentLabel: string;
 *   paymentStatuses: {
 *     due: string;
 *     overdue: string;
 *     pendingConfirmation: string;
 *     paid: string;
 *   };
 *   role: "buyer" | "seller";
 *   isActiveContract: boolean;
 *   earlyPayoffPending: boolean;
 *   pendingKey: string | null;
 *   contract: import("../model/types.js").InstallmentContractFromApi;
 *   canBuyerMarkPayment: (
 *     contract: import("../model/types.js").InstallmentContractFromApi,
 *     payment: import("../model/types.js").InstallmentPaymentFromApi,
 *   ) => boolean;
 *   onMarkPaid: (paymentIndex: number) => void;
 *   onConfirmPayment: (paymentIndex: number) => void;
 *   onRejectPayment: (paymentIndex: number) => void;
 *   compact?: boolean;
 * }} props
 */
export function InstallmentContractCardPaymentRow({
  payment,
  paymentLabel,
  paymentStatuses,
  role,
  isActiveContract,
  earlyPayoffPending,
  pendingKey,
  contract,
  canBuyerMarkPayment,
  onMarkPaid,
  onConfirmPayment,
  onRejectPayment,
  compact = false,
}) {
  const dueDate = new Date(payment.dueAt).toLocaleDateString("ru-RU");
  const isOverdue = payment.status === paymentStatuses.overdue;
  const isPendingConfirmation =
    payment.status === paymentStatuses.pendingConfirmation;
  const isPaid = payment.status === paymentStatuses.paid;
  const isRemaining = !isPaid && !isOverdue && !isPendingConfirmation;

  return (
    <div
      className={[
        "installment-contract-card__payment",
        compact ? "installment-contract-card__payment_compact" : "",
        isPaid && "installment-contract-card__payment_paid",
        isRemaining && "installment-contract-card__payment_remaining",
        isOverdue && "installment-contract-card__payment_overdue",
        isPendingConfirmation && "installment-contract-card__payment_pending",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="installment-contract-card__payment-main">
        {!compact ? (
          <span className="installment-contract-card__payment-index">
            #{payment.paymentIndex}
          </span>
        ) : null}
        <span className="installment-contract-card__amount installment-contract-card__amount_payment">
          {formatPriceRub(payment.amountRub)}
        </span>
        <span className="installment-contract-card__payment-meta">
          {INSTALLMENT_UI.PAYMENT_DUE} {dueDate}
          {!compact ? ` · ${paymentLabel}` : null}
        </span>
        {compact ? (
          <span
            className={[
              "installment-contract-card__payment-status",
              isPaid && "installment-contract-card__payment-status_paid",
              isOverdue && "installment-contract-card__payment-status_overdue",
              isPendingConfirmation &&
                "installment-contract-card__payment-status_pending",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {paymentLabel}
          </span>
        ) : null}
      </div>
      {role === "buyer" && isActiveContract && canBuyerMarkPayment(contract, payment) ? (
        <button
          type="button"
          className="installment-contract-card__btn installment-contract-card__btn_primary"
          disabled={pendingKey != null}
          onClick={() => onMarkPaid(payment.paymentIndex)}
        >
          {pendingKey === `mark:${payment.paymentIndex}`
            ? INSTALLMENT_UI.ACTION_PENDING
            : INSTALLMENT_UI.MARK_PAID}
        </button>
      ) : null}
      {role === "seller" &&
      !earlyPayoffPending &&
      payment.status === paymentStatuses.pendingConfirmation ? (
        <span className="installment-contract-card__payment-actions">
          <button
            type="button"
            className="installment-contract-card__btn installment-contract-card__btn_primary"
            disabled={pendingKey != null}
            onClick={() => onConfirmPayment(payment.paymentIndex)}
          >
            {pendingKey === `confirm:${payment.paymentIndex}`
              ? INSTALLMENT_UI.ACTION_PENDING
              : INSTALLMENT_UI.CONFIRM_PAYMENT}
          </button>
          <button
            type="button"
            className="installment-contract-card__btn installment-contract-card__btn_danger"
            disabled={pendingKey != null}
            onClick={() => onRejectPayment(payment.paymentIndex)}
          >
            {pendingKey === `reject:${payment.paymentIndex}`
              ? INSTALLMENT_UI.ACTION_PENDING
              : INSTALLMENT_UI.REJECT_PAYMENT}
          </button>
        </span>
      ) : null}
    </div>
  );
}
