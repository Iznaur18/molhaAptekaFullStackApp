import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { patchProductInAllCatalogCaches } from "../../../entities/product/lib/catalogProductsQueryCache.js";
import { navigateToProductDetails } from "../../../entities/product/lib/navigateToProductDetails.js";
import { useMyFavoritesQuery } from "../../../entities/wishlist/model/useMyFavoritesQuery.js";
import { useWishlist } from "../../../entities/wishlist/model/useWishlist.js";
import { WISHLIST_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { pluralizeRu } from "../../../shared/lib/pluralizeRu.js";
import { ProfileListHero } from "../../../shared/ui/ProfileListHero/ProfileListHero.jsx";

import { WishlistRow } from "./WishlistRow.jsx";

import "./WishlistPage.css";

function WishlistHeroIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      />
    </svg>
  );
}

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

  const hero = (
    <ProfileListHero
      tone="accent"
      caption={WISHLIST_PAGE_UI.HERO_CAPTION}
      count={products.length}
      unit={pluralizeRu(products.length, WISHLIST_PAGE_UI.HERO_UNIT_FORMS)}
      info={WISHLIST_PAGE_UI.HERO_INFO}
      icon={<WishlistHeroIcon />}
    />
  );

  if (!isAuthorized) {
    return (
      <section className="wishlist-page wishlist-page_centered">
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
    return (
      <section className="wishlist-page">
        <p className="wishlist-page__state">{WISHLIST_PAGE_UI.LOADING}</p>
      </section>
    );
  }

  if (favoritesQuery.isError) {
    return (
      <section className="wishlist-page">
        <p className="wishlist-page__state wishlist-page__state_error" role="alert">
          {favoritesQuery.error instanceof Error
            ? favoritesQuery.error.message
            : WISHLIST_PAGE_UI.FETCH_FALLBACK}
        </p>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="wishlist-page wishlist-page_empty">
        <div className="wishlist-page__header">{hero}</div>
        <div className="wishlist-page__empty-body">
          <p className="wishlist-page__state">{WISHLIST_PAGE_UI.EMPTY}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="wishlist-page">
      <div className="wishlist-page__header">{hero}</div>
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
