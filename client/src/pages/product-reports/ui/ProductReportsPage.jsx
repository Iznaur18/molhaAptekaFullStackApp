import { useCallback, useEffect, useState } from "react";

import { fetchPendingProductReports } from "../../../entities/product-report/api/fetchPendingProductReports.js";
import { ProductReportGroupCard } from "../../../entities/product-report/ui/ProductReportGroupCard.jsx";
import { fetchPendingUserStoryReports } from "../../../entities/user-story/api/fetchPendingUserStoryReports.js";
import { UserStoryReportGroupCard } from "../../../entities/user-story/ui/UserStoryReportGroupCard.jsx";
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
  const [productGroups, setProductGroups] = useState(
    /** @type {import('../../../entities/product-report/model/types.js').ProductReportGroup[]} */ ([]),
  );
  const [storyGroups, setStoryGroups] = useState(
    /** @type {import('../../../entities/user-story/model/types.js').UserStoryReportGroup[]} */ ([]),
  );
  const [error, setError] = useState("");

  const loadQueue = useCallback(async () => {
    setPhase("loading");
    setError("");
    try {
      const [productResult, storyResult] = await Promise.all([
        fetchPendingProductReports(),
        fetchPendingUserStoryReports(),
      ]);
      setProductGroups(productResult.groups);
      setStoryGroups(storyResult.groups);
      setPhase("success");
      onQueueChanged?.();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : API_CLIENT_UI.FETCH_PRODUCT_REPORTS_FALLBACK,
      );
      setPhase("error");
    }
  }, [onQueueChanged]);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  const isEmpty = productGroups.length === 0 && storyGroups.length === 0;

  if (phase === "loading") {
    return (
      <p className="product-reports-page__state">{PRODUCT_REPORTS_PAGE_UI.LOADING}</p>
    );
  }

  if (phase === "error" && isEmpty) {
    return (
      <p
        className="product-reports-page__state product-reports-page__state_error"
        role="alert"
      >
        {error}
      </p>
    );
  }

  if (isEmpty) {
    return (
      <p className="product-reports-page__state">{PRODUCT_REPORTS_PAGE_UI.EMPTY}</p>
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

      {productGroups.length > 0 ? (
        <section className="product-reports-page__section">
          <h2 className="product-reports-page__section-title">
            {PRODUCT_REPORTS_PAGE_UI.SECTION_PRODUCTS}
          </h2>
          <ul className="product-reports-page__list" role="list">
            {productGroups.map((group) => (
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
        </section>
      ) : null}

      {storyGroups.length > 0 ? (
        <section className="product-reports-page__section">
          <h2 className="product-reports-page__section-title">
            {PRODUCT_REPORTS_PAGE_UI.SECTION_STORIES}
          </h2>
          <ul className="product-reports-page__list" role="list">
            {storyGroups.map((group) => (
              <li key={String(group.story._id)} role="listitem">
                <UserStoryReportGroupCard
                  group={group}
                  onResolved={() => void loadQueue()}
                  onOpenUser={(userId) => onSellerNameClick?.(userId)}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
