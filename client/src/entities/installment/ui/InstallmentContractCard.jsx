import { useInstallmentContractCard } from "../model/useInstallmentContractCard.js";
import { contractNeedsBuyerAttention } from "../lib/contractNeedsBuyerAttention.js";
import { contractNeedsSellerAttention } from "../lib/contractNeedsSellerAttention.js";
import { INSTALLMENT_CONTRACT_STATUS_COMPLETED } from "../model/constants.js";
import { PRODUCT_IMAGE_PLACEHOLDER_URL } from "../../product/model/productConstants.js";
import { INSTALLMENT_UI } from "../../../shared/config/appUiCopy.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";
import { resolveImageUrlForDisplay } from "../../../shared/lib/resolveUploadedImageUrl.js";
import { InstallmentContractCounterparty } from "./InstallmentContractCounterparty.jsx";
import { InstallmentContractCardSummary } from "./InstallmentContractCardSummary.jsx";
import { InstallmentContractCardPayments } from "./InstallmentContractCardPayments.jsx";
import { InstallmentContractProgressBar } from "./InstallmentContractProgressBar.jsx";
import { BuyerPassportSharePanel } from "./BuyerPassportSharePanel.jsx";

import "./InstallmentContractCard.css";

/**
 * @param {import("../model/types.js").InstallmentContractFromApi} contract
 * @param {(productId: string) => void} [onProductClick]
 */
function renderProductTitle(contract, onProductClick) {
  const title = contract.productNameAtContract;
  const resolved = resolveImageUrlForDisplay(String(contract.productImageUrl ?? "").trim());
  const imageUrl = resolved || PRODUCT_IMAGE_PLACEHOLDER_URL;
  const titleClass = onProductClick
    ? "installment-contract-card__title installment-contract-card__title_link"
    : "installment-contract-card__title";

  const titleNode = onProductClick ? (
    <span
      className={titleClass}
      role="link"
      tabIndex={0}
      onClick={(event) => {
        event.stopPropagation();
        onProductClick(String(contract.productId));
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          onProductClick(String(contract.productId));
        }
      }}
    >
      {title}
    </span>
  ) : (
    <span className={titleClass}>{title}</span>
  );

  return (
    <div className="installment-contract-card__product">
      <img
        className="installment-contract-card__thumb"
        src={imageUrl}
        alt=""
        loading="lazy"
        decoding="async"
      />
      {titleNode}
    </div>
  );
}

/**
 * @param {{
 *   contract: import("../model/types.js").InstallmentContractFromApi;
 *   role: "buyer" | "seller";
 *   onUpdated?: (contract: import("../model/types.js").InstallmentContractFromApi) => void;
 *   onCounterpartyClick?: (userId: string) => void;
 *   onProductClick?: (productId: string) => void;
 *   compact?: boolean;
 *   collapsible?: boolean;
 *   expanded?: boolean;
 *   onExpandedChange?: (expanded: boolean) => void;
 * }} props
 */
export function InstallmentContractCard({
  contract,
  role,
  onUpdated,
  onCounterpartyClick,
  onProductClick,
  compact = false,
  collapsible = false,
  expanded = true,
  onExpandedChange,
}) {
  const card = useInstallmentContractCard({ contract, role, onUpdated });
  const isExpanded = !collapsible || expanded;
  const needsAttention =
    role === "buyer"
      ? contractNeedsBuyerAttention(contract)
      : contractNeedsSellerAttention(contract);

  const toggleExpanded = () => {
    onExpandedChange?.(!expanded);
  };

  const pendingConfirmationPayment = (contract.payments ?? []).find(
    (payment) => payment.status === card.paymentStatuses.pendingConfirmation,
  );

  const nextDuePreview =
    role === "buyer" && card.nextPayablePayment
      ? INSTALLMENT_UI.PAYMENTS_NEXT_DUE(
          formatPriceRub(card.nextPayablePayment.amountRub),
          new Date(card.nextPayablePayment.dueAt).toLocaleDateString("ru-RU"),
        )
      : role === "seller" && card.earlyPayoffPending
        ? INSTALLMENT_UI.SALES_NEXT_ACTION_EARLY_PAYOFF
        : role === "seller" && pendingConfirmationPayment
          ? INSTALLMENT_UI.PAYMENTS_NEXT_DUE(
              formatPriceRub(pendingConfirmationPayment.amountRub),
              new Date(pendingConfirmationPayment.dueAt).toLocaleDateString("ru-RU"),
            )
          : null;

  const expandedBody = (
    <>
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

      {role === "seller" && contract.buyerPassportShare ? (
        <BuyerPassportSharePanel share={contract.buyerPassportShare} />
      ) : null}

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
              className="installment-contract-card__btn installment-contract-card__btn_cancel"
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
                  className="installment-contract-card__btn installment-contract-card__btn_warning"
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
                    className="installment-contract-card__btn installment-contract-card__btn_warning"
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
    </>
  );

  return (
    <article
      className={[
        "installment-contract-card",
        compact ? "installment-contract-card--compact" : "",
        collapsible ? "installment-contract-card--collapsible" : "",
        card.isFullyPaid && "installment-contract-card_completed",
        needsAttention && "installment-contract-card_attention",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="installment-contract-card__header">
        {collapsible ? (
          <button
            type="button"
            className="installment-contract-card__header-toggle"
            aria-expanded={isExpanded}
            onClick={toggleExpanded}
          >
            {renderProductTitle(contract, onProductClick)}
            <span
              className={[
                "installment-contract-card__chevron",
                isExpanded ? "installment-contract-card__chevron_expanded" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-hidden="true"
            >
              ▸
            </span>
          </button>
        ) : typeof onProductClick === "function" ? (
          <button
            type="button"
            className="installment-contract-card__product-button"
            onClick={() => onProductClick(String(contract.productId))}
          >
            {renderProductTitle(contract)}
          </button>
        ) : (
          renderProductTitle(contract)
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
        <InstallmentContractProgressBar
          percent={card.paidPercent}
          ariaLabel={`${INSTALLMENT_UI.CONTRACT_PAID}: ${card.paidPercent}%`}
        />
      ) : null}

      {collapsible ? (
        <div className="installment-contract-card__collapsible-region">
          {nextDuePreview ? (
          <div
            className={[
              "installment-contract-card__fold",
              !isExpanded ? "installment-contract-card__fold_open" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-hidden={isExpanded}
            inert={isExpanded ? true : undefined}
          >
              <div className="installment-contract-card__fold-inner">
                <p className="installment-contract-card__next-due">{nextDuePreview}</p>
              </div>
            </div>
          ) : null}
          <div
            className={[
              "installment-contract-card__fold",
              isExpanded ? "installment-contract-card__fold_open" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-hidden={!isExpanded}
            inert={!isExpanded ? true : undefined}
          >
            <div className="installment-contract-card__fold-inner installment-contract-card__fold-inner_body">
              {expandedBody}
            </div>
          </div>
        </div>
      ) : (
        expandedBody
      )}
    </article>
  );
}
