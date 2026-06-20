import { INSTALLMENT_CONTRACT_STATUS_COMPLETED } from "../model/constants.js";
import { INSTALLMENT_UI } from "../../../shared/config/appUiCopy.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";

/**
 * @param {{
 *   contract: import("../model/types.js").InstallmentContractFromApi;
 *   remainingRub: number;
 *   remainingDays: number;
 *   paidPercent: number;
 * }} props
 */
export function InstallmentContractCardSummary({
  contract,
  remainingRub,
  remainingDays,
  paidPercent,
}) {
  const isCompleted = contract.status === INSTALLMENT_CONTRACT_STATUS_COMPLETED;

  return (
    <div className="installment-contract-card__summary" aria-label={INSTALLMENT_UI.CONTRACT_PAID}>
      <div className="installment-contract-card__summary-tile">
        <span className="installment-contract-card__summary-label">
          {INSTALLMENT_UI.CONTRACT_PLAN}
        </span>
        <strong className="installment-contract-card__summary-value">
          {contract.monthsCount} мес × {formatPriceRub(contract.monthlyPaymentRub)}
        </strong>
      </div>
      <div className="installment-contract-card__summary-tile">
        <span className="installment-contract-card__summary-label">
          {INSTALLMENT_UI.CONTRACT_PAID}
        </span>
        <strong className="installment-contract-card__summary-value">
          {formatPriceRub(contract.paidAmountRub)}
          <span className="installment-contract-card__summary-muted">
            {" "}
            / {formatPriceRub(contract.totalAmountRub)}
          </span>
        </strong>
        <span className="installment-contract-card__summary-foot">{paidPercent}%</span>
      </div>
      {!isCompleted ? (
        <div className="installment-contract-card__summary-tile">
          <span className="installment-contract-card__summary-label">
            {INSTALLMENT_UI.CONTRACT_REMAINING}
          </span>
          <strong className="installment-contract-card__summary-value">
            {formatPriceRub(remainingRub)}
          </strong>
          <span className="installment-contract-card__summary-foot">
            {INSTALLMENT_UI.CONTRACT_DAYS_LEFT(remainingDays)}
          </span>
        </div>
      ) : null}
    </div>
  );
}
