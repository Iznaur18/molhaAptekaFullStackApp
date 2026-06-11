import { useRaffleByIdQuery } from "../../../entities/raffle/model/useRaffleByIdQuery.js";
import { useRaffleProductsQuery } from "../../../entities/raffle/model/useRaffleProductsQuery.js";
import { HomeCatalogGrid } from "../../home/ui/HomeCatalogGrid.jsx";
import {
  API_CLIENT_UI,
  RAFFLE_PRODUCTS_PAGE_UI,
} from "../../../shared/config/appUiCopy.js";

import "./RaffleProductsPage.css";

/**
 * @param {{
 *   raffleId: string;
 *   isAuthorized: boolean;
 *   currentUserId?: string | null;
 *   onRequestLoginAddToCart: () => void;
 *   onSellerNameClick: (userId: string) => void;
 *   onOpenProductDetails: (product: import('../../../entities/product/model/types.js').ProductFromApi) => void;
 *   onBackToCatalog: () => void;
 * }} props
 */
export function RaffleProductsPage({
  raffleId,
  isAuthorized,
  currentUserId = null,
  onRequestLoginAddToCart,
  onSellerNameClick,
  onOpenProductDetails,
  onBackToCatalog,
}) {
  const raffleQuery = useRaffleByIdQuery({ raffleId });
  const productsQuery = useRaffleProductsQuery({ raffleId });

  const raffle = raffleQuery.data ?? null;
  const products = productsQuery.data?.products ?? [];
  const isLoading = raffleQuery.isPending || productsQuery.isPending;
  const queryError = raffleQuery.error ?? productsQuery.error;
  const error =
    queryError instanceof Error
      ? queryError.message
      : API_CLIENT_UI.FETCH_RAFFLE_PRODUCTS_FALLBACK;
  const phase = isLoading ? "loading" : queryError ? "error" : "success";

  if (phase === "loading") {
    return (
      <p className="raffle-products-page__state">{RAFFLE_PRODUCTS_PAGE_UI.LOADING}</p>
    );
  }

  if (phase === "error") {
    return (
      <p
        className="raffle-products-page__state raffle-products-page__state_error"
        role="alert"
      >
        {error}
      </p>
    );
  }

  return (
    <div className="raffle-products-page">
      <header className="raffle-products-page__header">
        <button
          type="button"
          className="raffle-products-page__back"
          onClick={onBackToCatalog}
        >
          ← {RAFFLE_PRODUCTS_PAGE_UI.BACK_CATALOG}
        </button>
        <h2 className="raffle-products-page__title">
          {raffle?.title ?? RAFFLE_PRODUCTS_PAGE_UI.TITLE}
        </h2>
      </header>
      <HomeCatalogGrid
        products={products}
        selectedProductCategory={null}
        hasQuery={false}
        isMineMode={false}
        deletingProductId={null}
        onSellerNameClick={onSellerNameClick}
        myProductsCatalogError=""
        onOpenProductDetails={onOpenProductDetails}
        togglingAvailabilityProductId={null}
        isAuthorized={isAuthorized}
        currentUserId={currentUserId}
        onRequestLoginAddToCart={onRequestLoginAddToCart}
        showAddToCartOnCard={false}
        catalogSentinelRef={{ current: null }}
        catalogHasMore={false}
        isCatalogLoadingMore={false}
        catalogLoadMoreError={null}
        onRetryCatalogLoadMore={() => {}}
        highlightRaffleProducts
      />
    </div>
  );
}
