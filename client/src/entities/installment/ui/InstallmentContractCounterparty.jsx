import { COMMON_UI } from "../../../shared/config/appUiCopy.js";

import "./InstallmentContractCounterparty.css";

/**
 * @param {import("../model/types.js").InstallmentCounterpartyFromApi | null | undefined} counterparty
 */
function formatDisplayName(counterparty) {
  if (!counterparty) {
    return COMMON_UI.EM_DASH;
  }
  return counterparty.userName?.trim() || counterparty.email || COMMON_UI.EM_DASH;
}

/**
 * @param {{
 *   label: string;
 *   counterparty: import("../model/types.js").InstallmentCounterpartyFromApi | null | undefined;
 *   onUserClick?: (userId: string) => void;
 * }} props
 */
export function InstallmentContractCounterparty({
  label,
  counterparty,
  onUserClick,
}) {
  if (!counterparty?._id) {
    return null;
  }

  const displayName = formatDisplayName(counterparty);
  const canLink = typeof onUserClick === "function";

  return (
    <div className="installment-contract-counterparty">
      <span className="installment-contract-counterparty__label">{label}</span>
      {canLink ? (
        <button
          type="button"
          className="installment-contract-counterparty__name"
          onClick={() => onUserClick(String(counterparty._id))}
        >
          {displayName}
        </button>
      ) : (
        <span className="installment-contract-counterparty__name">
          {displayName}
        </span>
      )}
      {counterparty.userPhoneNumber ? (
        <span className="installment-contract-counterparty__detail">
          {counterparty.userPhoneNumber}
        </span>
      ) : null}
      {counterparty.email ? (
        <span className="installment-contract-counterparty__detail">
          {counterparty.email}
        </span>
      ) : null}
    </div>
  );
}
