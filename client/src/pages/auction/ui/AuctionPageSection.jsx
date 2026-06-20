/**
 * @param {{
 *   title: string;
 *   count: number;
 *   children: import("react").ReactNode;
 * }} props
 */
export function AuctionPageSection({ title, count, children }) {
  return (
    <section className="auction-dashboard__section">
      <div className="auction-dashboard__section-head">
        <h4 className="auction-dashboard__section-title">{title}</h4>
        <span className="auction-dashboard__section-count">{count}</span>
      </div>
      {children}
    </section>
  );
}
