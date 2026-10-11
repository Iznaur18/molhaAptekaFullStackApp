import "./AffiliateListingsPage.css";

const STATUS_TONE = {
  paid: "paid",
  pending: "pending",
  skipped_no_program: "skipped",
  skipped_antifraud: "skipped",
};

/**
 * Карточка одной партнёрской сделки: товар и статус сверху, ниже факты парами
 * «подпись → значение», дата внизу.
 *
 * @param {{
 *   title: string;
 *   status?: string;
 *   statusLabel?: string;
 *   facts: ReadonlyArray<{ label: string; value: string; accent?: boolean }>;
 *   dateLabel: string;
 * }} props
 */
export function AffiliateDealCard({ title, status, statusLabel, facts, dateLabel }) {
  const tone = status ? STATUS_TONE[status] : "";

  return (
    <li className="affiliate-listings-page__deal">
      <div className="affiliate-listings-page__deal-head">
        <span className="affiliate-listings-page__deal-title">{title}</span>
        {statusLabel ? (
          <span
            className={[
              "affiliate-listings-page__deal-status",
              tone ? `affiliate-listings-page__deal-status_${tone}` : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {statusLabel}
          </span>
        ) : null}
      </div>
      <dl className="affiliate-listings-page__deal-facts">
        {facts.map((fact) => (
          <div
            key={fact.label}
            className={[
              "affiliate-listings-page__deal-fact",
              fact.accent ? "affiliate-listings-page__deal-fact_accent" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <dt>{fact.label}</dt>
            <dd title={fact.value}>{fact.value}</dd>
          </div>
        ))}
      </dl>
      <span className="affiliate-listings-page__deal-date">{dateLabel}</span>
    </li>
  );
}
