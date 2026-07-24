import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { fetchCatalogProductsPage } from "../../api/fetchCatalogProductsPage.js";
import { navigateToProductDetails } from "../../lib/navigateToProductDetails.js";
import { resolveProductSimilarCatalogFilters } from "../../lib/resolveProductSimilarCatalogFilters.js";
import { CATALOG_PAGE_SIZE } from "../../model/productConstants.js";
import { catalogQueryKeys } from "../../model/catalogQueryKeys.js";
import { ProductCard } from "../ProductCard.jsx";
import { PRODUCT_SIMILAR_UI } from "../../../../shared/config/appUiCopy.js";

import "./ProductDetailsModalSimilarTab.css";

const PRODUCT_SIMILAR_MAX_PAGES = 3;
const PRODUCT_SIMILAR_MAX_ITEMS = CATALOG_PAGE_SIZE * PRODUCT_SIMILAR_MAX_PAGES;

/**
 * @param {{
 *   product: import("../../model/types.js").ProductFromApi;
 *   excludeProductId: string;
 *   enabled?: boolean;
 *   isAuthorized?: boolean;
 *   onRequestLoginAddToCart?: () => void;
 *   currentUserId?: string | null;
 * }} props
 */
export function ProductDetailsModalSimilarTab({
  product,
  excludeProductId,
  enabled = true,
  isAuthorized = false,
  onRequestLoginAddToCart = () => {},
  currentUserId = null,
}) {
  const navigate = useNavigate();
  const filters = resolveProductSimilarCatalogFilters(product);

  const catalogQuery = useInfiniteQuery({
    queryKey: [...catalogQueryKeys.all, "similar", filters],
    enabled: enabled && filters != null,
    initialPageParam: 1,
    retry: 1,
    queryFn: async ({ pageParam }) =>
      fetchCatalogProductsPage({
        page: Number(pageParam) || 1,
        limit: CATALOG_PAGE_SIZE,
        categoryId: filters?.categoryId,
        productCategory: filters?.productCategory,
      }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      if (page >= totalPages || page >= PRODUCT_SIMILAR_MAX_PAGES) {
        return undefined;
      }
      return page + 1;
    },
  });

  const products = useMemo(() => {
    const excludeId = excludeProductId.trim();
    const flat = (catalogQuery.data?.pages ?? []).flatMap((page) => page.products);
    return flat
      .filter((item) => String(item._id) !== excludeId)
      .slice(0, PRODUCT_SIMILAR_MAX_ITEMS);
  }, [catalogQuery.data?.pages, excludeProductId]);

  const canFetchMore =
    catalogQuery.hasNextPage === true &&
    !catalogQuery.isFetchingNextPage &&
    products.length < PRODUCT_SIMILAR_MAX_ITEMS;

  if (filters == null) {
    return <p className="product-details-similar-tab__empty">{PRODUCT_SIMILAR_UI.EMPTY}</p>;
  }

  if (catalogQuery.isPending && products.length === 0) {
    return (
      <p className="product-details-similar-tab__state" role="status">
        {PRODUCT_SIMILAR_UI.LOADING}
      </p>
    );
  }

  if (catalogQuery.isError && products.length === 0) {
    return (
      <div className="product-details-similar-tab__error-wrap">
        <p className="product-details-similar-tab__empty" role="alert">
          {catalogQuery.error instanceof Error
            ? catalogQuery.error.message
            : PRODUCT_SIMILAR_UI.FETCH_FALLBACK}
        </p>
        <button
          type="button"
          className="product-details-similar-tab__retry"
          onClick={() => {
            void catalogQuery.refetch();
          }}
        >
          Повторить
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return <p className="product-details-similar-tab__empty">{PRODUCT_SIMILAR_UI.EMPTY}</p>;
  }

  return (
    <div className="product-details-similar-tab">
      <div className="product-details-similar-tab__grid">
        {products.map((item) => (
          <ProductCard
            key={String(item._id)}
            product={item}
            isAuthorized={isAuthorized}
            currentUserId={currentUserId}
            onRequestLoginAddToCart={onRequestLoginAddToCart}
            onOpenDetails={() => navigateToProductDetails(navigate, item)}
          />
        ))}
      </div>
      {canFetchMore ? (
        <button
          type="button"
          className="product-details-similar-tab__more"
          disabled={catalogQuery.isFetchingNextPage}
          onClick={() => {
            void catalogQuery.fetchNextPage();
          }}
        >
          {catalogQuery.isFetchingNextPage ? PRODUCT_SIMILAR_UI.LOADING : "Ещё"}
        </button>
      ) : null}
    </div>
  );
}
