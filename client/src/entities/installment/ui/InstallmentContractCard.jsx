import { useInstallmentContractCard } from "../model/useInstallmentContractCard.js";
import { INSTALLMENT_CONTRACT_STATUS_COMPLETED } from "../model/constants.js";
import { INSTALLMENT_UI } from "../../../shared/config/appUiCopy.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";
import { InstallmentContractCounterparty } from "./InstallmentContractCounterparty.jsx";
import { InstallmentContractCardSummary } from "./InstallmentContractCardSummary.jsx";
import { InstallmentContractCardPayments } from "./InstallmentContractCardPayments.jsx";

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
  const card = useInstallmentContractCard({ contract, role, onUpdated });

  return (
    <article
      className={[
        "installment-contract-card",
        compact ? "installment-contract-card--compact" : "",
        card.isFullyPaid && "installment-contract-card_completed",
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
            {card.statusLabel}
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
          aria-valuenow={card.paidPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${INSTALLMENT_UI.CONTRACT_PAID}: ${card.paidPercent}%`}
        >
          <div
            className="installment-contract-card__progress-fill"
            style={{ width: `${card.paidPercent}%` }}
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

      {compact ? (
        <InstallmentContractCardSummary
          contract={contract}
          remainingRub={card.remainingRub}
          remainingDays={card.remainingDays}
          paidPercent={card.paidPercent}
        />
      ) : (
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
                  {formatPriceRub(card.remainingRub)}
                </span>
                <span className="installment-contract-card__payment-meta">
                  {" "}
                  · {INSTALLMENT_UI.CONTRACT_DAYS_LEFT(card.remainingDays)}
                </span>
              </dd>
            </div>
          ) : null}
          <div className="installment-contract-card__meta-row">
            <dt>{INSTALLMENT_UI.CONTRACT_STATUS}:</dt>
            <dd>{card.statusLabel}</dd>
          </div>
        </dl>
      )}

      <InstallmentContractCardPayments
        contract={contract}
        role={role}
        compact={compact}
        paymentStatusLabels={card.paymentStatusLabels}
        paymentStatuses={card.paymentStatuses}
        isActiveContract={card.isActiveContract}
        earlyPayoffPending={card.earlyPayoffPending}
        pendingKey={card.pendingKey}
        canBuyerMarkPayment={card.canBuyerMarkPayment}
        onMarkPaid={card.handleMarkPaid}
        onConfirmPayment={card.handleConfirmPayment}
        onRejectPayment={card.handleRejectPayment}
      />

      {card.error ? (
        <p className="installment-contract-card__error" role="alert">
          {card.error}
        </p>
      ) : null}

      {card.isActiveContract ? (
        <div className="installment-contract-card__actions">
          {role === "buyer" && card.earlyPayoffPending ? (
            <button
              type="button"
              className="installment-contract-card__btn"
              disabled={card.pendingKey != null}
              onClick={card.handleCancelEarlyPayoff}
            >
              {card.pendingKey === "early-cancel"
                ? INSTALLMENT_UI.ACTION_PENDING
                : INSTALLMENT_UI.CANCEL_EARLY_PAYOFF}
            </button>
          ) : null}
          {role === "buyer" && !card.earlyPayoffPending && card.nextPayablePayment != null ? (
            <button
              type="button"
              className="installment-contract-card__btn"
              disabled={card.pendingKey != null}
              onClick={card.handleEarlyPayoff}
            >
              {card.pendingKey === "early"
                ? INSTALLMENT_UI.ACTION_PENDING
                : INSTALLMENT_UI.EARLY_PAYOFF}
            </button>
          ) : null}
          {role === "seller" && card.earlyPayoffPending ? (
            <>
              <button
                type="button"
                className="installment-contract-card__btn installment-contract-card__btn_primary"
                disabled={card.pendingKey != null}
                onClick={card.handleConfirmEarlyPayoff}
              >
                {card.pendingKey === "early-confirm"
                  ? INSTALLMENT_UI.ACTION_PENDING
                  : INSTALLMENT_UI.CONFIRM_EARLY_PAYOFF}
              </button>
              <button
                type="button"
                className="installment-contract-card__btn installment-contract-card__btn_danger"
                disabled={card.pendingKey != null}
                onClick={card.handleRejectEarlyPayoff}
              >
                {card.pendingKey === "early-reject"
                  ? INSTALLMENT_UI.ACTION_PENDING
                  : INSTALLMENT_UI.REJECT_EARLY_PAYOFF}
              </button>
            </>
          ) : null}
          {role === "buyer" ? (
            <>
              {!card.showDisputeForm ? (
                <button
                  type="button"
                  className="installment-contract-card__btn"
                  disabled={card.pendingKey != null}
                  onClick={() => card.setShowDisputeForm(true)}
                >
                  {INSTALLMENT_UI.OPEN_DISPUTE}
                </button>
              ) : (
                <div className="installment-contract-card__dispute-form">
                  <textarea
                    className="installment-contract-card__textarea"
                    value={card.disputeReason}
                    onChange={(event) => card.setDisputeReason(event.target.value)}
                    placeholder={INSTALLMENT_UI.DISPUTE_REASON_PLACEHOLDER}
                  />
                  <button
                    type="button"
                    className="installment-contract-card__btn installment-contract-card__btn_primary"
                    disabled={card.pendingKey != null}
                    onClick={card.handleOpenDispute}
                  >
                    {card.pendingKey === "dispute"
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
