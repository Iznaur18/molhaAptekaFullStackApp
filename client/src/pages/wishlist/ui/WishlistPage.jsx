import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { patchProductInAllCatalogCaches } from "../../../entities/product/lib/catalogProductsQueryCache.js";
import { navigateToProductDetails } from "../../../entities/product/lib/navigateToProductDetails.js";
import { useMyFavoritesQuery } from "../../../entities/wishlist/model/useMyFavoritesQuery.js";
import { useWishlist } from "../../../entities/wishlist/model/useWishlist.js";
import { WISHLIST_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import { WishlistRow } from "./WishlistRow.jsx";

import "./WishlistPage.css";

/**
 * @param {{
 *   isAuthorized: boolean;
 *   currentUserId?: string | null;
 *   isPremiumUser?: boolean;
 *   onRequestLogin: () => void;
 * }} props
 */
export function WishlistPage({
  isAuthorized,
  currentUserId = null,
  isPremiumUser = false,
  onRequestLogin,
}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const favoritesQuery = useMyFavoritesQuery({ enabled: isAuthorized });
  const { items } = useWishlist();

  const productsFromQuery = favoritesQuery.data?.products ?? [];
  const products = useMemo(() => {
    const byId = new Map(productsFromQuery.map((product) => [String(product._id), product]));
    return Object.entries(items)
      .sort(([, a], [, b]) => b - a)
      .map(([productId]) => byId.get(productId))
      .filter(Boolean);
  }, [items, productsFromQuery]);

  const handleProductClick = useCallback(
    (product) => {
      navigateToProductDetails(navigate, product);
    },
    [navigate],
  );

  const handleProductStatsUpdate = useCallback(
    (productId, stats) => {
      patchProductInAllCatalogCaches(queryClient, productId, (product) => ({
        ...product,
        ...stats,
      }));
    },
    [queryClient],
  );

  if (!isAuthorized) {
    return (
      <section className="wishlist-page">
        <p className="wishlist-page__hint">{WISHLIST_PAGE_UI.LOGIN_HINT}</p>
        <button
          type="button"
          className="wishlist-page__login"
          onClick={onRequestLogin}
        >
          {WISHLIST_PAGE_UI.LOGIN_BUTTON}
        </button>
      </section>
    );
  }

  if (favoritesQuery.isPending) {
    return <p className="wishlist-page__state">{WISHLIST_PAGE_UI.LOADING}</p>;
  }

  if (favoritesQuery.isError) {
    return (
      <p className="wishlist-page__state wishlist-page__state_error" role="alert">
        {favoritesQuery.error instanceof Error
          ? favoritesQuery.error.message
          : WISHLIST_PAGE_UI.FETCH_FALLBACK}
      </p>
    );
  }

  if (products.length === 0) {
    return <p className="wishlist-page__state">{WISHLIST_PAGE_UI.EMPTY}</p>;
  }

  return (
    <section className="wishlist-page">
      <ul className="wishlist-page__list" role="list">
        {products.map((product) => (
          <li key={product._id} role="listitem">
            <WishlistRow
              product={product}
              onProductClick={handleProductClick}
              onProductStatsUpdate={handleProductStatsUpdate}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
