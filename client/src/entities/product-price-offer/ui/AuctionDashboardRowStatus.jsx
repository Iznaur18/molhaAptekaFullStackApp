/**
 * @param {{
 *   tone?: "neutral" | "attention" | "success";
 *   children: import("react").ReactNode;
 * }} props
 */
export function AuctionDashboardRowStatus({ tone = "neutral", children }) {
  if (!children) {
    return null;
  }

  return (
    <span
      className={`auction-dashboard-row__status-pill auction-dashboard-row__status-pill_${tone}`}
    >
      {children}
    </span>
  );
}
