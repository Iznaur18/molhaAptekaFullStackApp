/**
 * @param {{
 *   onAccept: () => void;
 *   onReject: () => void;
 *   disabled?: boolean;
 *   acceptLabel: string;
 *   rejectLabel: string;
 *   pendingLabel: string;
 * }} props
 */
export function AuctionDashboardSellerActions({
  onAccept,
  onReject,
  disabled = false,
  acceptLabel,
  rejectLabel,
  pendingLabel,
}) {
  return (
    <div className="auction-dashboard-row__actions" role="group">
      <button
        type="button"
        className="auction-dashboard-row__btn auction-dashboard-row__btn_secondary"
        disabled={disabled}
        onClick={onReject}
      >
        {rejectLabel}
      </button>
      <button
        type="button"
        className="auction-dashboard-row__btn auction-dashboard-row__btn_accept"
        disabled={disabled}
        onClick={onAccept}
      >
        {disabled ? pendingLabel : acceptLabel}
      </button>
    </div>
  );
}
