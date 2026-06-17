import { useInstallmentContractCard } from "../model/useInstallmentContractCard.js";
import { INSTALLMENT_CONTRACT_STATUS_COMPLETED } from "../model/constants.js";
import { INSTALLMENT_UI } from "../../../shared/config/appUiCopy.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";
import { InstallmentContractCounterparty } from "./InstallmentContractCounterparty.jsx";

import "./InstallmentContractCard.css";

/**
 * @param {{
 *   contract: import("../model/types.js").InstallmentContractFromApi;
 *   role: "buyer" | "seller";
 *   onUpdated?: (contract: import("../model/types.js").InstallmentContractFromApi) => void;
 *   onCounterpartyClick?: (userId: string) => void;
 *   onProductClick?: (productId: string) => void;
 *   compact?: boolean;
 * }} props
 */
export function InstallmentContractCard({
  contract,
  role,
  onUpdated,
  onCounterpartyClick,
  onProductClick,
  compact = false,
}) {
  const {
    remainingRub,
    remainingDays,
    statusLabel,
    paidPercent,
    nextPayablePayment,
    earlyPayoffPending,
    isActiveContract,
    isFullyPaid,
    pendingKey,
    error,
    showDisputeForm,
    setShowDisputeForm,
    disputeReason,
    setDisputeReason,
    handleMarkPaid,
    handleConfirmPayment,
    handleRejectPayment,
    handleEarlyPayoff,
    handleConfirmEarlyPayoff,
    handleCancelEarlyPayoff,
    handleRejectEarlyPayoff,
    handleOpenDispute,
    paymentStatusLabels,
    canBuyerMarkPayment,
    paymentStatuses,
  } = useInstallmentContractCard({ contract, role, onUpdated });

  return (
    <article
      className={[
        "installment-contract-card",
        compact ? "installment-contract-card--compact" : "",
        isFullyPaid && "installment-contract-card_completed",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="installment-contract-card__header">
        {typeof onProductClick === "function" ? (
          <button
            type="button"
            className="installment-contract-card__title installment-contract-card__title_link"
            onClick={() => onProductClick(String(contract.productId))}
          >
            {contract.productNameAtContract}
          </button>
        ) : (
          <h3 className="installment-contract-card__title">
            {contract.productNameAtContract}
          </h3>
        )}
        {compact ? (
          <span
            className={[
              "installment-contract-card__status-pill",
              `installment-contract-card__status-pill_${contract.status}`,
            ].join(" ")}
          >
            {statusLabel}
          </span>
        ) : null}
        {contract.hasOverduePayment ? (
          <p className="installment-contract-card__overdue" role="status">
            {INSTALLMENT_UI.OVERDUE_BADGE}
          </p>
        ) : null}
      </div>

      {compact ? (
        <div
          className="installment-contract-card__progress"
          role="progressbar"
          aria-valuenow={paidPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${INSTALLMENT_UI.CONTRACT_PAID}: ${paidPercent}%`}
        >
          <div
            className="installment-contract-card__progress-fill"
            style={{ width: `${paidPercent}%` }}
          />
        </div>
      ) : null}

      {role === "buyer" ? (
        <InstallmentContractCounterparty
          label={INSTALLMENT_UI.SELLER_LABEL}
          counterparty={contract.seller}
          onUserClick={onCounterpartyClick}
        />
      ) : (
        <InstallmentContractCounterparty
          label={INSTALLMENT_UI.BUYER_LABEL}
          counterparty={contract.buyer}
          onUserClick={onCounterpartyClick}
        />
      )}

      <dl className="installment-contract-card__meta">
        <div className="installment-contract-card__meta-row">
          <dt>{INSTALLMENT_UI.CONTRACT_PLAN}:</dt>
          <dd>
            {contract.planTitle} · {contract.monthsCount} мес ×{" "}
            <span className="installment-contract-card__amount">
              {formatPriceRub(contract.monthlyPaymentRub)}
            </span>
          </dd>
        </div>
        <div className="installment-contract-card__meta-row">
          <dt>{INSTALLMENT_UI.CONTRACT_PAID}:</dt>
          <dd>
            <span className="installment-contract-card__amount">
              {formatPriceRub(contract.paidAmountRub)}
            </span>
            <span className="installment-contract-card__amount-separator"> / </span>
            <span className="installment-contract-card__amount installment-contract-card__amount_total">
              {formatPriceRub(contract.totalAmountRub)}
            </span>
          </dd>
        </div>
        {contract.status !== INSTALLMENT_CONTRACT_STATUS_COMPLETED ? (
          <div className="installment-contract-card__meta-row">
            <dt>{INSTALLMENT_UI.CONTRACT_REMAINING}:</dt>
            <dd>
              <span className="installment-contract-card__amount">
                {formatPriceRub(remainingRub)}
              </span>
              <span className="installment-contract-card__payment-meta">
                {" "}
                · {INSTALLMENT_UI.CONTRACT_DAYS_LEFT(remainingDays)}
              </span>
            </dd>
          </div>
        ) : null}
        {!compact ? (
          <div className="installment-contract-card__meta-row">
            <dt>{INSTALLMENT_UI.CONTRACT_STATUS}:</dt>
            <dd>{statusLabel}</dd>
          </div>
        ) : null}
      </dl>

      <section className="installment-contract-card__payments">
        <h4 className="installment-contract-card__payments-title">
          {INSTALLMENT_UI.PAYMENTS_HEADING}
        </h4>
        {contract.payments.map((payment) => {
          const paymentLabel = paymentStatusLabels[payment.status] ?? payment.status;
          const dueDate = new Date(payment.dueAt).toLocaleDateString("ru-RU");
          const isOverdue = payment.status === paymentStatuses.overdue;
          const isPendingConfirmation =
            payment.status === paymentStatuses.pendingConfirmation;
          const isPaid = payment.status === paymentStatuses.paid;
          const isRemaining = !isPaid && !isOverdue && !isPendingConfirmation;

          return (
            <div
              key={`${payment.paymentIndex}-${payment._id ?? "p"}`}
              className={[
                "installment-contract-card__payment",
                isPaid && "installment-contract-card__payment_paid",
                isRemaining && "installment-contract-card__payment_remaining",
                isOverdue && "installment-contract-card__payment_overdue",
                isPendingConfirmation && "installment-contract-card__payment_pending",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div className="installment-contract-card__payment-main">
                <span className="installment-contract-card__payment-index">
                  #{payment.paymentIndex}
                </span>
                <span className="installment-contract-card__amount installment-contract-card__amount_payment">
                  {formatPriceRub(payment.amountRub)}
                </span>
                <span className="installment-contract-card__payment-meta">
                  {INSTALLMENT_UI.PAYMENT_DUE} {dueDate} · {paymentLabel}
                </span>
              </div>
              {role === "buyer" &&
              isActiveContract &&
              canBuyerMarkPayment(contract, payment) ? (
                <button
                  type="button"
                  className="installment-contract-card__btn installment-contract-card__btn_primary"
                  disabled={pendingKey != null}
                  onClick={() => handleMarkPaid(payment.paymentIndex)}
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
                    onClick={() => handleConfirmPayment(payment.paymentIndex)}
                  >
                    {pendingKey === `confirm:${payment.paymentIndex}`
                      ? INSTALLMENT_UI.ACTION_PENDING
                      : INSTALLMENT_UI.CONFIRM_PAYMENT}
                  </button>
                  <button
                    type="button"
                    className="installment-contract-card__btn installment-contract-card__btn_danger"
                    disabled={pendingKey != null}
                    onClick={() => handleRejectPayment(payment.paymentIndex)}
                  >
                    {pendingKey === `reject:${payment.paymentIndex}`
                      ? INSTALLMENT_UI.ACTION_PENDING
                      : INSTALLMENT_UI.REJECT_PAYMENT}
                  </button>
                </span>
              ) : null}
            </div>
          );
        })}
      </section>

      {error ? (
        <p className="installment-contract-card__error" role="alert">
          {error}
        </p>
      ) : null}

      {isActiveContract ? (
        <div className="installment-contract-card__actions">
          {role === "buyer" && earlyPayoffPending ? (
            <button
              type="button"
              className="installment-contract-card__btn"
              disabled={pendingKey != null}
              onClick={handleCancelEarlyPayoff}
            >
              {pendingKey === "early-cancel"
                ? INSTALLMENT_UI.ACTION_PENDING
                : INSTALLMENT_UI.CANCEL_EARLY_PAYOFF}
            </button>
          ) : null}
          {role === "buyer" && !earlyPayoffPending && nextPayablePayment != null ? (
            <button
              type="button"
              className="installment-contract-card__btn"
              disabled={pendingKey != null}
              onClick={handleEarlyPayoff}
            >
              {pendingKey === "early"
                ? INSTALLMENT_UI.ACTION_PENDING
                : INSTALLMENT_UI.EARLY_PAYOFF}
            </button>
          ) : null}
          {role === "seller" && earlyPayoffPending ? (
            <>
              <button
                type="button"
                className="installment-contract-card__btn installment-contract-card__btn_primary"
                disabled={pendingKey != null}
                onClick={handleConfirmEarlyPayoff}
              >
                {pendingKey === "early-confirm"
                  ? INSTALLMENT_UI.ACTION_PENDING
                  : INSTALLMENT_UI.CONFIRM_EARLY_PAYOFF}
              </button>
              <button
                type="button"
                className="installment-contract-card__btn installment-contract-card__btn_danger"
                disabled={pendingKey != null}
                onClick={handleRejectEarlyPayoff}
              >
                {pendingKey === "early-reject"
                  ? INSTALLMENT_UI.ACTION_PENDING
                  : INSTALLMENT_UI.REJECT_EARLY_PAYOFF}
              </button>
            </>
          ) : null}
          {role === "buyer" ? (
            <>
              {!showDisputeForm ? (
                <button
                  type="button"
                  className="installment-contract-card__btn"
                  disabled={pendingKey != null}
                  onClick={() => setShowDisputeForm(true)}
                >
                  {INSTALLMENT_UI.OPEN_DISPUTE}
                </button>
              ) : (
                <div className="installment-contract-card__dispute-form">
                  <textarea
                    className="installment-contract-card__textarea"
                    value={disputeReason}
                    onChange={(event) => setDisputeReason(event.target.value)}
                    placeholder={INSTALLMENT_UI.DISPUTE_REASON_PLACEHOLDER}
                  />
                  <button
                    type="button"
                    className="installment-contract-card__btn installment-contract-card__btn_primary"
                    disabled={pendingKey != null}
                    onClick={handleOpenDispute}
                  >
                    {pendingKey === "dispute"
                      ? INSTALLMENT_UI.ACTION_PENDING
                      : INSTALLMENT_UI.OPEN_DISPUTE}
                  </button>
                </div>
              )}
            </>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
