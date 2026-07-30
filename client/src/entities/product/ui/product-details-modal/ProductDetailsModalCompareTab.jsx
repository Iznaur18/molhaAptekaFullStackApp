import { useNavigate } from "react-router-dom";

import { navigateToProductDetails } from "../../lib/navigateToProductDetails.js";
import { useComparableProductsQuery } from "../../model/useComparableProductsQuery.js";
import { ProductCard } from "../ProductCard.jsx";
import { PRODUCT_COMPARE_UI } from "../../../../shared/config/appUiCopy.js";

import "./ProductDetailsModalCompareTab.css";

/**
 * @param {{
 *   productId: string;
 *   enabled?: boolean;
 *   isAuthorized?: boolean;
 *   onRequestLoginAddToCart?: () => void;
 *   currentUserId?: string | null;
 * }} props
 */
export function ProductDetailsModalCompareTab({
  productId,
  enabled = true,
  isAuthorized = false,
  onRequestLoginAddToCart = () => {},
  currentUserId = null,
}) {
  const navigate = useNavigate();
  const compareQuery = useComparableProductsQuery({
    productId,
    enabled: enabled && String(productId ?? "").trim().length > 0,
  });

  const products = compareQuery.data ?? [];

  if (compareQuery.isPending && products.length === 0) {
    return (
      <p className="product-details-compare-tab__state" role="status">
        {PRODUCT_COMPARE_UI.LOADING}
      </p>
    );
  }

  if (compareQuery.isError && products.length === 0) {
    return (
      <div className="product-details-compare-tab__error-wrap">
        <p className="product-details-compare-tab__empty" role="alert">
          {compareQuery.error instanceof Error
            ? compareQuery.error.message
            : PRODUCT_COMPARE_UI.FETCH_FALLBACK}
        </p>
        <button
          type="button"
          className="product-details-compare-tab__retry"
          onClick={() => {
            void compareQuery.refetch();
          }}
        >
          {PRODUCT_COMPARE_UI.RETRY}
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return <p className="product-details-compare-tab__empty">{PRODUCT_COMPARE_UI.EMPTY}</p>;
  }

  return (
    <div
      className="product-details-compare-tab"
      aria-label={PRODUCT_COMPARE_UI.SECTION_ARIA}
    >
      <div className="product-details-compare-tab__grid">
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
    </div>
  );
}
