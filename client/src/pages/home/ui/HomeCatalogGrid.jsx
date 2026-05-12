import { useMemo } from "react";

import { ProductCard } from "../../../entities/product/ui/ProductCard.jsx";
import { HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";

const pickEmptyMessage = ({ products, hasQuery, isMineMode, isFiltered }) => {
  if (products.length === 0) {
    if (hasQuery) return HOME_PAGE_UI.EMPTY_BY_QUERY;
    return isMineMode
      ? HOME_PAGE_UI.EMPTY_MY_PRODUCTS
      : HOME_PAGE_UI.EMPTY_NO_PRODUCTS;
  }
  if (isFiltered) {
    return isMineMode
      ? HOME_PAGE_UI.EMPTY_MY_FILTERED
      : HOME_PAGE_UI.EMPTY_CATEGORY;
  }
  return HOME_PAGE_UI.EMPTY_NO_PRODUCTS;
};

/**
 * @param {{
 *   products: import('../../../entities/product/model/types.js').ProductFromApi[];
 *   selectedProductCategory: import('../../../entities/product/model/types.js').ProductCategory | null;
 *   hasQuery: boolean;
 *   isMineMode: boolean;
 *   deletingProductId: string | null;
 *   onSellerNameClick: (userId: string) => void;
 *   onDeleteMyProduct: (productId: string) => void;
 *   myProductsCatalogError: string;
 *   onOpenProductDetails: (product: import('../../../entities/product/model/types.js').ProductFromApi) => void;
 *   onSetMyProductAvailability: (productId: string, productIsAvailable: boolean) => void | Promise<void>;
 *   togglingAvailabilityProductId: string | null;
 *   isAuthorized: boolean;
 *   onRequestLoginAddToCart: () => void;
 * }} props
 */
export function HomeCatalogGrid({
  products,
  selectedProductCategory,
  hasQuery,
  isMineMode,
  deletingProductId,
  onSellerNameClick,
  onDeleteMyProduct,
  myProductsCatalogError,
  onOpenProductDetails,
  onSetMyProductAvailability,
  togglingAvailabilityProductId,
  isAuthorized,
  onRequestLoginAddToCart,
}) {
  const visibleProducts = useMemo(() => {
    if (!selectedProductCategory) return products;
    return products.filter(
      (p) => p.productCategory === selectedProductCategory,
    );
  }, [products, selectedProductCategory]);

  const emptyMessage = pickEmptyMessage({
    products,
    hasQuery,
    isMineMode,
    isFiltered: visibleProducts.length === 0 && products.length > 0,
  });

  return (
    <>
      {myProductsCatalogError ? (
        <p className="home-page__state home-page__state_error" role="alert">
          {myProductsCatalogError}
        </p>
      ) : null}
      {visibleProducts.length === 0 ? (
        <p className="home-page__state">{emptyMessage}</p>
      ) : (
        <div className="home-page__grid" role="list">
          {visibleProducts.map((product) => (
            <div
              key={product._id}
              className="home-page__cell"
              role="listitem"
            >
              <ProductCard
                product={product}
                onSellerNameClick={onSellerNameClick}
                onDeleteProduct={isMineMode ? onDeleteMyProduct : undefined}
                isDeletePending={deletingProductId === String(product._id)}
                onSetProductAvailability={
                  isMineMode ? onSetMyProductAvailability : undefined
                }
                isAvailabilityTogglePending={
                  togglingAvailabilityProductId === String(product._id)
                }
                onOpenDetails={onOpenProductDetails}
                isAuthorized={isAuthorized}
                onRequestLoginAddToCart={onRequestLoginAddToCart}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
