import { useMyAffiliateSalesQuery } from "../../../entities/user/model/useMyAffiliateSalesQuery.js";
import { AFFILIATE_SALES_UI } from "../../../shared/config/appUiCopy.js";

import { AffiliateDealCard } from "./AffiliateDealCard.jsx";

import "./AffiliateListingsPage.css";

/**
 * Продажи продавца, в которых покупателя привёл партнёр.
 *
 * @param {{ isAuthorized: boolean }} props
 */
export function AffiliateSalesPanel({ isAuthorized }) {
  const salesQuery = useMyAffiliateSalesQuery({ enabled: isAuthorized });
  const rootClass = "affiliate-listings-page affiliate-listings-page--embedded";

  if (!isAuthorized) {
    return null;
  }

  if (salesQuery.isLoading) {
    return (
      <section className={rootClass}>
        <p className="affiliate-listings-page__state">{AFFILIATE_SALES_UI.LOADING}</p>
      </section>
    );
  }

  if (salesQuery.isError) {
    return (
      <section className={rootClass}>
        <p
          className="affiliate-listings-page__state affiliate-listings-page__state_error"
          role="alert"
        >
          {salesQuery.error instanceof Error
            ? salesQuery.error.message
            : AFFILIATE_SALES_UI.LOAD_ERROR}
        </p>
      </section>
    );
  }

  const rows = salesQuery.data?.rows ?? [];

  return (
    <section className={rootClass} aria-label={AFFILIATE_SALES_UI.TITLE}>
      <div className="affiliate-listings-page__card">
        <h3 className="affiliate-listings-page__title">{AFFILIATE_SALES_UI.TITLE}</h3>
        <p className="affiliate-listings-page__hint">{AFFILIATE_SALES_UI.HINT}</p>
        {rows.length === 0 ? (
          <p className="affiliate-listings-page__hint">{AFFILIATE_SALES_UI.EMPTY}</p>
        ) : (
          <ul className="affiliate-listings-page__list">
            {rows.map((row) => (
              <AffiliateDealCard
                key={`${row.orderId}-${row.orderItemId}`}
                title={row.productName}
                status={row.status}
                statusLabel={AFFILIATE_SALES_UI.STATUS[row.status] ?? row.status}
                facts={[
                  {
                    label: AFFILIATE_SALES_UI.PARTNER,
                    value: row.partnerName || AFFILIATE_SALES_UI.NAME_FALLBACK,
                  },
                  {
                    label: AFFILIATE_SALES_UI.BUYER,
                    value: row.buyerName || AFFILIATE_SALES_UI.NAME_FALLBACK,
                  },
                  ...(row.status === "paid"
                    ? [
                        {
                          label: AFFILIATE_SALES_UI.AMOUNT,
                          value: String(row.amount),
                          accent: true,
                        },
                        {
                          label: AFFILIATE_SALES_UI.PERCENT,
                          value:
                            row.percentUsed == null
                              ? AFFILIATE_SALES_UI.NAME_FALLBACK
                              : `${row.percentUsed}%`,
                        },
                      ]
                    : []),
                ]}
                dateLabel={`${AFFILIATE_SALES_UI.DATE} ${
                  row.createdAt
                    ? new Date(row.createdAt).toLocaleDateString("ru-RU")
                    : AFFILIATE_SALES_UI.NAME_FALLBACK
                }`}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
