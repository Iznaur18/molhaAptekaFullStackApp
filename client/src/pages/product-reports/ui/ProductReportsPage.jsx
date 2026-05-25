import { useCallback, useEffect, useState } from "react";

import { fetchPendingProductReports } from "../../../entities/product-report/api/fetchPendingProductReports.js";
import { ProductReportGroupCard } from "../../../entities/product-report/ui/ProductReportGroupCard.jsx";
import {
  API_CLIENT_UI,
  PRODUCT_REPORTS_PAGE_UI,
} from "../../../shared/config/appUiCopy.js";

import "./ProductReportsPage.css";

/**
 * @param {{
 *   onSellerNameClick?: (userId: string) => void;
 *   onProductClick?: (product: import('../../../entities/product/model/types.js').ProductFromApi) => void;
 *   onQueueChanged?: () => void;
 * }} props
 */
export function ProductReportsPage({
  onSellerNameClick,
  onProductClick,
  onQueueChanged,
}) {
  const [phase, setPhase] = useState("loading");
  const [groups, setGroups] = useState(
    /** @type {import('../../../entities/product-report/model/types.js').ProductReportGroup[]} */ ([]),
  );
  const [error, setError] = useState("");

  const loadQueue = useCallback(async () => {
    setPhase("loading");
    setError("");
    try {
      const { groups: list } = await fetchPendingProductReports();
      setGroups(list);
      setPhase("success");
      onQueueChanged?.();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : API_CLIENT_UI.FETCH_PRODUCT_REPORTS_FALLBACK,
      );
      setPhase("error");
    }
  }, [onQueueChanged]);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  if (phase === "loading") {
    return (
      <p className="product-reports-page__state">
        {PRODUCT_REPORTS_PAGE_UI.LOADING}
      </p>
    );
  }

  if (phase === "error" && groups.length === 0) {
    return (
      <p
        className="product-reports-page__state product-reports-page__state_error"
        role="alert"
      >
        {error}
      </p>
    );
  }

  if (groups.length === 0) {
    return (
      <p className="product-reports-page__state">
        {PRODUCT_REPORTS_PAGE_UI.EMPTY}
      </p>
    );
  }

  return (
    <div className="product-reports-page">
      {error ? (
        <p
          className="product-reports-page__state product-reports-page__state_error"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <ul className="product-reports-page__list" role="list">
        {groups.map((group) => (
          <li key={String(group.product._id)} role="listitem">
            <ProductReportGroupCard
              group={group}
              onResolved={() => void loadQueue()}
              onOpenProduct={(product) => onProductClick?.(product)}
              onOpenUser={(userId) => onSellerNameClick?.(userId)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
