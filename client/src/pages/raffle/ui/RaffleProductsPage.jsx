import { useCallback, useEffect, useState } from "react";

import { HomeCatalogGrid } from "../../home/ui/HomeCatalogGrid.jsx";
import { fetchRaffleById } from "../../../entities/raffle/api/fetchRaffleById.js";
import { fetchRaffleProducts } from "../../../entities/raffle/api/fetchRaffleProducts.js";
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
  const [phase, setPhase] = useState("loading");
  const [raffle, setRaffle] = useState(
    /** @type {import('../../../entities/raffle/model/types.js').RaffleFromApi | null} */ (
      null
    ),
  );
  const [products, setProducts] = useState(
    /** @type {import('../../../entities/product/model/types.js').ProductFromApi[]} */ ([]),
  );
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setPhase("loading");
    setError("");
    try {
      const [raffleRow, productsPayload] = await Promise.all([
        fetchRaffleById(raffleId),
        fetchRaffleProducts(raffleId, { limit: 60 }),
      ]);
      setRaffle(raffleRow);
      setProducts(productsPayload.products);
      setPhase("success");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : API_CLIENT_UI.FETCH_RAFFLE_PRODUCTS_FALLBACK,
      );
      setPhase("error");
    }
  }, [raffleId]);

  useEffect(() => {
    void load();
  }, [load]);

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
