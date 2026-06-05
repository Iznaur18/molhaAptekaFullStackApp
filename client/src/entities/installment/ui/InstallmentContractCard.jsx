import { useMemo, useState } from "react";

import {
  cancelInstallmentEarlyPayoff,
  confirmInstallmentEarlyPayoff,
  confirmInstallmentPayment,
  rejectInstallmentEarlyPayoff,
  rejectInstallmentPayment,
  markInstallmentEarlyPayoff,
  markInstallmentPaymentPaid,
  openInstallmentDispute,
} from "../api/installmentApi.js";
import {
  INSTALLMENT_CONTRACT_STATUS_ACTIVE,
  INSTALLMENT_CONTRACT_STATUS_COMPLETED,
  INSTALLMENT_CONTRACT_STATUS_PENDING_FIRST_PAYMENT,
  INSTALLMENT_PAYMENT_STATUS_DUE,
  INSTALLMENT_PAYMENT_STATUS_OVERDUE,
  INSTALLMENT_PAYMENT_STATUS_PAID,
  INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION,
} from "../model/constants.js";
import { canBuyerMarkInstallmentPayment } from "../lib/canBuyerMarkInstallmentPayment.js";
import { isEarlyPayoffPendingConfirmation } from "../lib/isEarlyPayoffPendingConfirmation.js";
import {
  getInstallmentRemainingAmountRub,
  getInstallmentRemainingDays,
} from "../lib/resolveInstallmentUiState.js";
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
 * }} props
 */
export function InstallmentContractCard({
  contract,
  role,
  onUpdated,
  onCounterpartyClick,
  onProductClick,
}) {
  const [pendingKey, setPendingKey] = useState(null);
  const [error, setError] = useState("");
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");

  const remainingRub = getInstallmentRemainingAmountRub(contract);
  const remainingDays = getInstallmentRemainingDays(contract);
  const statusLabel =
    INSTALLMENT_UI.CONTRACT_STATUS_LABEL[contract.status] ?? contract.status;

  const nextPayablePayment = useMemo(
    () =>
      contract.payments.find(
        (payment) =>
          payment.status === INSTALLMENT_PAYMENT_STATUS_DUE ||
          payment.status === INSTALLMENT_PAYMENT_STATUS_OVERDUE,
      ),
    [contract.payments],
  );

  const earlyPayoffPending = useMemo(
    () => isEarlyPayoffPendingConfirmation(contract),
    [contract],
  );

  const isActiveContract =
    contract.status === INSTALLMENT_CONTRACT_STATUS_PENDING_FIRST_PAYMENT ||
    contract.status === INSTALLMENT_CONTRACT_STATUS_ACTIVE;

  const isFullyPaid = useMemo(() => {
    if (contract.status === INSTALLMENT_CONTRACT_STATUS_COMPLETED) {
      return true;
    }
    const payments = contract.payments ?? [];
    return (
      payments.length > 0 &&
      payments.every((payment) => payment.status === INSTALLMENT_PAYMENT_STATUS_PAID)
    );
  }, [contract.status, contract.payments]);

  const runAction = async (key, action) => {
    setPendingKey(key);
    setError("");
    try {
      const result = await action();
      if (result?.contract) {
        onUpdated?.(result.contract);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : INSTALLMENT_UI.ERROR_GENERIC);
    } finally {
      setPendingKey(null);
    }
  };

  const handleMarkPaid = (paymentIndex) => {
    void runAction(`mark:${paymentIndex}`, () =>
      markInstallmentPaymentPaid(String(contract._id), paymentIndex),
    );
  };

  const handleConfirmPayment = (paymentIndex) => {
    void runAction(`confirm:${paymentIndex}`, () =>
      confirmInstallmentPayment(String(contract._id), paymentIndex),
    );
  };

  const handleRejectPayment = (paymentIndex) => {
    void runAction(`reject:${paymentIndex}`, () =>
      rejectInstallmentPayment(String(contract._id), paymentIndex),
    );
  };

  const handleEarlyPayoff = () => {
    void runAction("early", () => markInstallmentEarlyPayoff(String(contract._id)));
  };

  const handleConfirmEarlyPayoff = () => {
    void runAction("early-confirm", () =>
      confirmInstallmentEarlyPayoff(String(contract._id)),
    );
  };

  const handleCancelEarlyPayoff = () => {
    void runAction("early-cancel", () =>
      cancelInstallmentEarlyPayoff(String(contract._id)),
    );
  };

  const handleRejectEarlyPayoff = () => {
    void runAction("early-reject", () =>
      rejectInstallmentEarlyPayoff(String(contract._id)),
    );
  };

  const handleOpenDispute = () => {
    const reason = disputeReason.trim();
    if (!reason) return;
    void runAction("dispute", async () => {
      const result = await openInstallmentDispute(String(contract._id), reason);
      setShowDisputeForm(false);
      setDisputeReason("");
      return result;
    });
  };

  return (
    <article
      className={[
        "installment-contract-card",
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
        {contract.hasOverduePayment ? (
          <p className="installment-contract-card__overdue" role="status">
            {INSTALLMENT_UI.OVERDUE_BADGE}
          </p>
        ) : null}
      </div>

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
        <div className="installment-contract-card__meta-row">
          <dt>{INSTALLMENT_UI.CONTRACT_STATUS}:</dt>
          <dd>{statusLabel}</dd>
        </div>
      </dl>

      <section className="installment-contract-card__payments">
        <h4 className="installment-contract-card__payments-title">
          {INSTALLMENT_UI.PAYMENTS_HEADING}
        </h4>
        {contract.payments.map((payment) => {
          const paymentLabel =
            INSTALLMENT_UI.PAYMENT_STATUS_LABEL[payment.status] ?? payment.status;
          const dueDate = new Date(payment.dueAt).toLocaleDateString("ru-RU");
          const isOverdue = payment.status === INSTALLMENT_PAYMENT_STATUS_OVERDUE;
          const isPendingConfirmation =
            payment.status === INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION;
          const isPaid = payment.status === INSTALLMENT_PAYMENT_STATUS_PAID;
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
              canBuyerMarkInstallmentPayment(contract, payment) ? (
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
              payment.status === INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION ? (
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
