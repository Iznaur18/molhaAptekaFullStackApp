import { useMyAffiliateEarningsQuery } from "../../../entities/user/model/useMyAffiliateEarningsQuery.js";
import { AFFILIATE_LISTINGS_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import "./AffiliateListingsPage.css";

/**
 * @param {{
 *   isAuthorized: boolean;
 *   onRequestLogin: () => void;
 * }} props
 */
export function AffiliateListingsPage({ isAuthorized, onRequestLogin }) {
  const earningsQuery = useMyAffiliateEarningsQuery({ enabled: isAuthorized });

  if (!isAuthorized) {
    return (
      <section className="affiliate-listings-page affiliate-listings-page_centered">
        <p className="affiliate-listings-page__hint">
          {AFFILIATE_LISTINGS_PAGE_UI.LOGIN_HINT}
        </p>
        <button
          type="button"
          className="app-btn app-btn--primary"
          onClick={onRequestLogin}
        >
          {AFFILIATE_LISTINGS_PAGE_UI.LOGIN_BUTTON}
        </button>
      </section>
    );
  }

  if (earningsQuery.isLoading) {
    return (
      <section className="affiliate-listings-page">
        <p className="affiliate-listings-page__state">
          {AFFILIATE_LISTINGS_PAGE_UI.LOADING}
        </p>
      </section>
    );
  }

  if (earningsQuery.isError) {
    return (
      <section className="affiliate-listings-page">
        <p
          className="affiliate-listings-page__state affiliate-listings-page__state_error"
          role="alert"
        >
          {earningsQuery.error instanceof Error
            ? earningsQuery.error.message
            : AFFILIATE_LISTINGS_PAGE_UI.LOAD_ERROR}
        </p>
      </section>
    );
  }

  const earnings = earningsQuery.data;

  return (
    <section
      className="affiliate-listings-page"
      aria-label={AFFILIATE_LISTINGS_PAGE_UI.ARIA}
    >
      <div className="affiliate-listings-page__card">
        <h3 className="affiliate-listings-page__title">
          {AFFILIATE_LISTINGS_PAGE_UI.EARNINGS_TITLE}
        </h3>
        <p className="affiliate-listings-page__hint">
          {AFFILIATE_LISTINGS_PAGE_UI.SELLER_PAYOUT_HINT}
        </p>
        <p className="affiliate-listings-page__meta">
          {AFFILIATE_LISTINGS_PAGE_UI.LOYALTY_BALANCE}:{" "}
          {earnings?.loyaltyPointsBalance ?? 0}
        </p>
        {(earnings?.rows?.length ?? 0) === 0 ? (
          <p className="affiliate-listings-page__hint">
            {AFFILIATE_LISTINGS_PAGE_UI.EARNINGS_EMPTY}
          </p>
        ) : (
          <ul className="affiliate-listings-page__list">
            {earnings.rows.map((row) => (
              <li
                key={row.sourceId ?? `${row.orderId}-${row.paidAt}`}
                className="affiliate-listings-page__row"
              >
                {row.productName ? (
                  <span className="affiliate-listings-page__row-title">
                    {row.productName}
                  </span>
                ) : null}
                <span>
                  {AFFILIATE_LISTINGS_PAGE_UI.EARNINGS_AMOUNT}: {row.amount}
                </span>
                <span>
                  {AFFILIATE_LISTINGS_PAGE_UI.EARNINGS_PERCENT}:{" "}
                  {row.percentUsed ?? "—"}%
                </span>
                <span>
                  {AFFILIATE_LISTINGS_PAGE_UI.EARNINGS_DATE}:{" "}
                  {row.paidAt
                    ? new Date(row.paidAt).toLocaleString("ru-RU")
                    : "—"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
