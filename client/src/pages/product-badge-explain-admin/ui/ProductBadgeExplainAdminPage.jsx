import { useMemo } from "react";

import { PRODUCT_BADGE_EXPLAIN_ADMIN_CARDS } from "../../../entities/product-badge-explain/lib/productBadgeExplainAdminCards.js";
import { useProductBadgeExplainsQuery } from "../../../entities/product-badge-explain/model/useProductBadgeExplainsQuery.js";
import { ProductBadgeExplainAdminCard } from "../../../entities/product-badge-explain/ui/ProductBadgeExplainAdminCard.jsx";
import { PRODUCT_BADGE_EXPLAIN_ADMIN_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import "./ProductBadgeExplainAdminPage.css";

/**
 * @param {{ embedded?: boolean }} [props]
 */
export function ProductBadgeExplainAdminPage({ embedded = false }) {
  const displaysQuery = useProductBadgeExplainsQuery();
  const displaysByKey = useMemo(() => {
    const map = new Map();
    for (const row of displaysQuery.data?.displays ?? []) {
      map.set(row.badgeKey, row);
    }
    return map;
  }, [displaysQuery.data?.displays]);

  if (displaysQuery.isPending) {
    return (
      <p className="product-badge-explain-admin__status">
        {PRODUCT_BADGE_EXPLAIN_ADMIN_PAGE_UI.LOADING}
      </p>
    );
  }

  if (displaysQuery.isError) {
    return (
      <p className="product-badge-explain-admin__error" role="alert">
        {displaysQuery.error instanceof Error
          ? displaysQuery.error.message
          : PRODUCT_BADGE_EXPLAIN_ADMIN_PAGE_UI.LOAD_ERROR}
      </p>
    );
  }

  return (
    <section
      className={[
        "product-badge-explain-admin",
        embedded ? "product-badge-explain-admin_embedded" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {embedded ? null : (
        <header className="product-badge-explain-admin__header">
          <h2 className="product-badge-explain-admin__title">
            {PRODUCT_BADGE_EXPLAIN_ADMIN_PAGE_UI.TITLE}
          </h2>
          <p className="product-badge-explain-admin__hint">
            {PRODUCT_BADGE_EXPLAIN_ADMIN_PAGE_UI.HINT}
          </p>
        </header>
      )}
      {embedded ? (
        <p className="product-badge-explain-admin__hint product-badge-explain-admin__hint_embedded">
          {PRODUCT_BADGE_EXPLAIN_ADMIN_PAGE_UI.HINT}
        </p>
      ) : null}
      <div className="product-badge-explain-admin__grid">
        {PRODUCT_BADGE_EXPLAIN_ADMIN_CARDS.map((card) => {
          const display = displaysByKey.get(card.badgeKey);
          return (
            <ProductBadgeExplainAdminCard
              key={card.badgeKey}
              badgeKey={card.badgeKey}
              title={card.title}
              hint={card.hint}
              imageUrl={display?.imageUrl ?? null}
              description={display?.description ?? null}
            />
          );
        })}
      </div>
    </section>
  );
}
