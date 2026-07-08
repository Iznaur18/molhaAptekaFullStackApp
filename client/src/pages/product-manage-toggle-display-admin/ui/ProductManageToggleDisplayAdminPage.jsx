import { useMemo } from "react";

import { PRODUCT_MANAGE_TOGGLE_ADMIN_CARDS } from "../../../entities/product-manage-toggle-display/lib/productManageToggleAdminCards.js";
import { useProductManageToggleDisplaysQuery } from "../../../entities/product-manage-toggle-display/model/useProductManageToggleDisplaysQuery.js";
import { ProductManageToggleAdminCard } from "../../../entities/product-manage-toggle-display/ui/ProductManageToggleAdminCard.jsx";
import { PRODUCT_MANAGE_TOGGLE_DISPLAY_ADMIN_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import "./ProductManageToggleDisplayAdminPage.css";

/**
 * @param {{ embedded?: boolean }} [props]
 */
export function ProductManageToggleDisplayAdminPage({ embedded = false }) {
  const displaysQuery = useProductManageToggleDisplaysQuery();
  const displaysByKey = useMemo(() => {
    const map = new Map();
    for (const row of displaysQuery.data?.displays ?? []) {
      map.set(row.toggleKey, row);
    }
    return map;
  }, [displaysQuery.data?.displays]);

  if (displaysQuery.isPending) {
    return (
      <p className="product-manage-toggle-display-admin__status">
        {PRODUCT_MANAGE_TOGGLE_DISPLAY_ADMIN_PAGE_UI.LOADING}
      </p>
    );
  }

  if (displaysQuery.isError) {
    return (
      <p className="product-manage-toggle-display-admin__error" role="alert">
        {displaysQuery.error instanceof Error
          ? displaysQuery.error.message
          : PRODUCT_MANAGE_TOGGLE_DISPLAY_ADMIN_PAGE_UI.LOAD_ERROR}
      </p>
    );
  }

  return (
    <section
      className={[
        "product-manage-toggle-display-admin",
        embedded ? "product-manage-toggle-display-admin_embedded" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {embedded ? null : (
        <header className="product-manage-toggle-display-admin__header">
          <h2 className="product-manage-toggle-display-admin__title">
            {PRODUCT_MANAGE_TOGGLE_DISPLAY_ADMIN_PAGE_UI.TITLE}
          </h2>
          <p className="product-manage-toggle-display-admin__hint">
            {PRODUCT_MANAGE_TOGGLE_DISPLAY_ADMIN_PAGE_UI.HINT}
          </p>
        </header>
      )}
      <div className="product-manage-toggle-display-admin__grid">
        {PRODUCT_MANAGE_TOGGLE_ADMIN_CARDS.map((card) => {
          const display = displaysByKey.get(card.toggleKey);
          return (
            <ProductManageToggleAdminCard
              key={card.toggleKey}
              toggleKey={card.toggleKey}
              variant={card.variant}
              title={card.title}
              description={card.description}
              checked={card.checked}
              imageUrl={display?.imageUrl ?? null}
            />
          );
        })}
      </div>
    </section>
  );
}
