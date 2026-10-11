import { useMyAffiliateEarningsQuery } from "../../../entities/user/model/useMyAffiliateEarningsQuery.js";
import {
  AFFILIATE_LISTINGS_PAGE_UI,
  AFFILIATE_SALES_UI,
} from "../../../shared/config/appUiCopy.js";

import { AffiliateDealCard } from "./AffiliateDealCard.jsx";

import "./AffiliateListingsPage.css";

/**
 * @param {{
 *   isAuthorized: boolean;
 *   onRequestLogin?: () => void;
 *   embedded?: boolean;
 * }} props
 */
export function AffiliateListingsPage({
  isAuthorized,
  onRequestLogin,
  embedded = false,
}) {
  const earningsQuery = useMyAffiliateEarningsQuery({ enabled: isAuthorized });

  if (!isAuthorized) {
    if (embedded) {
      return null;
    }
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

  const rootClass = embedded
    ? "affiliate-listings-page affiliate-listings-page--embedded"
    : "affiliate-listings-page";

  if (earningsQuery.isLoading) {
    return (
      <section className={rootClass}>
        <p className="affiliate-listings-page__state">
          {AFFILIATE_LISTINGS_PAGE_UI.LOADING}
        </p>
      </section>
    );
  }

  if (earningsQuery.isError) {
    return (
      <section className={rootClass}>
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
    <section className={rootClass} aria-label={AFFILIATE_LISTINGS_PAGE_UI.ARIA}>
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
              <AffiliateDealCard
                key={row.sourceId ?? `${row.orderId}-${row.paidAt}`}
                title={row.productName || AFFILIATE_LISTINGS_PAGE_UI.EARNINGS_PRODUCT}
                status="paid"
                statusLabel={AFFILIATE_SALES_UI.STATUS.paid}
                facts={[
                  {
                    label: AFFILIATE_SALES_UI.SELLER,
                    value: row.sellerName || AFFILIATE_SALES_UI.NAME_FALLBACK,
                  },
                  {
                    label: AFFILIATE_SALES_UI.BUYER,
                    value: row.buyerName || AFFILIATE_SALES_UI.NAME_FALLBACK,
                  },
                  {
                    label: AFFILIATE_LISTINGS_PAGE_UI.EARNINGS_AMOUNT,
                    value: String(row.amount),
                    accent: true,
                  },
                  {
                    label: AFFILIATE_LISTINGS_PAGE_UI.EARNINGS_PERCENT,
                    value:
                      row.percentUsed == null
                        ? AFFILIATE_SALES_UI.NAME_FALLBACK
                        : `${row.percentUsed}%`,
                  },
                ]}
                dateLabel={
                  row.paidAt
                    ? new Date(row.paidAt).toLocaleString("ru-RU")
                    : AFFILIATE_SALES_UI.NAME_FALLBACK
                }
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
