/**
 * @param {{
 *   isPending?: boolean;
 *   isAccepted?: boolean;
 *   children: import("react").ReactNode;
 * }} props
 */
export function AuctionDashboardRowStatus({ isPending = false, isAccepted = false, children }) {
  if (!children) {
    return null;
  }

  return (
    <span
      className={[
        "auction-dashboard-row__status-pill",
        isPending ? "auction-dashboard-row__status-pill_pending" : "",
        isAccepted ? "auction-dashboard-row__status-pill_accepted" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
