import { useCallback } from "react";

import { usePendingProductReportsQuery } from "../../../entities/product-report/model/usePendingProductReportsQuery.js";
import { ProductReportGroupCard } from "../../../entities/product-report/ui/ProductReportGroupCard.jsx";
import { usePendingUserStoryReportsQuery } from "../../../entities/user-story/model/usePendingUserStoryReportsQuery.js";
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
  const productReportsQuery = usePendingProductReportsQuery();
  const storyReportsQuery = usePendingUserStoryReportsQuery();

  const productGroups = productReportsQuery.data?.groups ?? [];
  const storyGroups = storyReportsQuery.data?.groups ?? [];
  const isLoading = productReportsQuery.isPending || storyReportsQuery.isPending;
  const queryError = productReportsQuery.error ?? storyReportsQuery.error;
  const error =
    queryError instanceof Error
      ? queryError.message
      : API_CLIENT_UI.FETCH_PRODUCT_REPORTS_FALLBACK;
  const phase = isLoading ? "loading" : queryError ? "error" : "success";

  const reloadQueue = useCallback(async () => {
    if (onQueueChanged) {
      await onQueueChanged();
      return;
    }
    await Promise.all([productReportsQuery.refetch(), storyReportsQuery.refetch()]);
  }, [onQueueChanged, productReportsQuery, storyReportsQuery]);

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
      {error && !isEmpty ? (
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
                  onResolved={() => void reloadQueue()}
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
                  onResolved={() => void reloadQueue()}
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
