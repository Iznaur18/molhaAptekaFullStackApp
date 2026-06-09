import { useCallback, useMemo, useState } from "react";

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

  const [sectionFilter, setSectionFilter] = useState("");
  const productGroups = productReportsQuery.data?.groups ?? [];
  const storyGroups = storyReportsQuery.data?.groups ?? [];
  const totalGroupsCount = productGroups.length + storyGroups.length;
  const visibleProductGroups = sectionFilter === "stories" ? [] : productGroups;
  const visibleStoryGroups = sectionFilter === "products" ? [] : storyGroups;
  const visibleGroupsCount = visibleProductGroups.length + visibleStoryGroups.length;
  const sectionFilterOptions = useMemo(
    () => [
      { value: "", label: PRODUCT_REPORTS_PAGE_UI.SECTION_FILTER_ALL },
      { value: "products", label: PRODUCT_REPORTS_PAGE_UI.SECTION_PRODUCTS },
      { value: "stories", label: PRODUCT_REPORTS_PAGE_UI.SECTION_STORIES },
    ],
    [],
  );
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

  const emptyMessage =
    totalGroupsCount === 0
      ? PRODUCT_REPORTS_PAGE_UI.EMPTY
      : sectionFilter
        ? PRODUCT_REPORTS_PAGE_UI.EMPTY_BY_FILTER
        : PRODUCT_REPORTS_PAGE_UI.EMPTY;

  if (isEmpty) {
    return (
      <div className="product-reports-page">
        <ReportsToolbar
          sectionFilter={sectionFilter}
          onSectionFilterChange={setSectionFilter}
          groupsCount={0}
          sectionFilterOptions={sectionFilterOptions}
        />
        <p className="product-reports-page__state">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="product-reports-page">
      <ReportsToolbar
        sectionFilter={sectionFilter}
        onSectionFilterChange={setSectionFilter}
        groupsCount={visibleGroupsCount}
        sectionFilterOptions={sectionFilterOptions}
      />

      {error && !isEmpty ? (
        <p
          className="product-reports-page__state product-reports-page__state_error"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {visibleGroupsCount === 0 ? (
        <p className="product-reports-page__state">{emptyMessage}</p>
      ) : (
        <>
          {visibleProductGroups.length > 0 ? (
            <section
              className="product-reports-page__section"
              aria-label={PRODUCT_REPORTS_PAGE_UI.SECTION_PRODUCTS}
            >
              <h2 className="product-reports-page__section-title">
                {PRODUCT_REPORTS_PAGE_UI.SECTION_PRODUCTS}
              </h2>
              <ul className="product-reports-page__list" role="list">
                {visibleProductGroups.map((group) => (
                  <li key={String(group.product._id)} role="listitem">
                    <ProductReportGroupCard
                      compact
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

          {visibleStoryGroups.length > 0 ? (
            <section
              className="product-reports-page__section"
              aria-label={PRODUCT_REPORTS_PAGE_UI.SECTION_STORIES}
            >
              <h2 className="product-reports-page__section-title">
                {PRODUCT_REPORTS_PAGE_UI.SECTION_STORIES}
              </h2>
              <ul className="product-reports-page__list" role="list">
                {visibleStoryGroups.map((group) => (
                  <li key={String(group.story._id)} role="listitem">
                    <UserStoryReportGroupCard
                      compact
                      group={group}
                      onResolved={() => void reloadQueue()}
                      onOpenUser={(userId) => onSellerNameClick?.(userId)}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}

/**
 * @param {{
 *   sectionFilter: string;
 *   onSectionFilterChange: (value: string) => void;
 *   groupsCount: number;
 *   sectionFilterOptions: Array<{ value: string; label: string }>;
 * }} props
 */
function ReportsToolbar({
  sectionFilter,
  onSectionFilterChange,
  groupsCount,
  sectionFilterOptions,
}) {
  return (
    <div className="product-reports-page__toolbar">
      <div className="product-reports-page__toolbar-head">
        <h3 className="product-reports-page__heading">{PRODUCT_REPORTS_PAGE_UI.TITLE}</h3>
        <span className="product-reports-page__count">
          {PRODUCT_REPORTS_PAGE_UI.COUNT(groupsCount)}
        </span>
      </div>

      <div
        className="product-reports-page__section-chips"
        role="group"
        aria-label={PRODUCT_REPORTS_PAGE_UI.SECTION_FILTER_LABEL}
      >
        {sectionFilterOptions.map((option) => {
          const isActive = sectionFilter === option.value;

          return (
            <button
              key={option.value || "all"}
              type="button"
              className={[
                "product-reports-page__section-chip",
                isActive ? "product-reports-page__section-chip_active" : "",
                option.value ? `product-reports-page__section-chip_${option.value}` : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={isActive}
              onClick={() => onSectionFilterChange(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
