import { useCallback, useEffect, useState } from "react";

import { fetchUserProfileById } from "../../../entities/user/api/fetchUserProfileById.js";
import { pickUserProfilePhotoUrl } from "../../../entities/user/lib/pickUserProfilePhotoUrl.js";
import {
  formatProfileImageObjectPosition,
  getUserAvatarFocus,
} from "../../../entities/user/lib/profileImageFocus.js";
import { UserFollowButton } from "../../../entities/user-follow/ui/UserFollowButton.jsx";
import { UserPremiumAvatar } from "../../../entities/user/ui/UserPremiumAvatar.jsx";
import { UserPremiumDisplayName } from "../../../entities/user/ui/UserPremiumDisplayName.jsx";
import { HomeCatalogGrid } from "../../home/ui/HomeCatalogGrid.jsx";
import { useSellerProductsCatalog } from "../model/useSellerProductsCatalog.js";
import { SELLER_PRODUCTS_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import "./SellerProductsPage.css";

/**
 * @param {{
 *   sellerId: string;
 *   isAuthorized: boolean;
 *   isSessionReady: boolean;
 *   currentUserId?: string | null;
 *   onRequestLogin: () => void;
 *   onRequestLoginAddToCart: () => void;
 *   onSellerNameClick: (userId: string) => void;
 *   onOpenProductDetails: (
 *     product: import('../../../entities/product/model/types.js').ProductFromApi,
 *   ) => void;
 *   onBackToCatalog: () => void;
 *   onGoToMyProducts: () => void;
 * }} props
 */
export function SellerProductsPage({
  sellerId,
  isAuthorized,
  isSessionReady,
  currentUserId = null,
  onRequestLogin,
  onRequestLoginAddToCart,
  onSellerNameClick,
  onOpenProductDetails,
  onBackToCatalog,
  onGoToMyProducts,
}) {
  const [profilePhase, setProfilePhase] = useState("idle");
  const [seller, setSeller] = useState(
    /** @type {import('../../../entities/user/model/types.js').UserPublicProfile | null} */ (
      null
    ),
  );
  const [profileError, setProfileError] = useState("");

  const catalogEnabled = isAuthorized && isSessionReady;
  const {
    phase: catalogPhase,
    products,
    error: catalogError,
    hasMore,
    isLoadingMore,
    loadMoreError,
    sentinelRef,
    retryLoadMore,
  } = useSellerProductsCatalog({ sellerId, enabled: catalogEnabled });

  const loadProfile = useCallback(async () => {
    if (!catalogEnabled) return;
    setProfilePhase("loading");
    setProfileError("");
    try {
      const user = await fetchUserProfileById(sellerId);
      setSeller(user);
      setProfilePhase("success");
    } catch (e) {
      setProfileError(
        e instanceof Error ? e.message : SELLER_PRODUCTS_PAGE_UI.FETCH_PROFILE_FALLBACK,
      );
      setProfilePhase("error");
    }
  }, [catalogEnabled, sellerId]);

  useEffect(() => {
    if (currentUserId != null && String(sellerId) === String(currentUserId)) {
      onGoToMyProducts();
    }
  }, [currentUserId, onGoToMyProducts, sellerId]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handleFollowChange = useCallback(
    (/** @type {{ isFollowing: boolean }} */ patch) => {
      setSeller((prev) =>
        prev == null ? prev : { ...prev, isFollowing: patch.isFollowing },
      );
    },
    [],
  );

  if (!isSessionReady) {
    return (
      <p className="seller-products-page__state">{SELLER_PRODUCTS_PAGE_UI.LOADING}</p>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="seller-products-page">
        <header className="seller-products-page__header">
          <button
            type="button"
            className="seller-products-page__back"
            onClick={onBackToCatalog}
          >
            ← {SELLER_PRODUCTS_PAGE_UI.BACK_CATALOG}
          </button>
        </header>
        <p className="seller-products-page__state">
          {SELLER_PRODUCTS_PAGE_UI.LOGIN_HINT}
        </p>
        <button
          type="button"
          className="seller-products-page__login"
          onClick={onRequestLogin}
        >
          {SELLER_PRODUCTS_PAGE_UI.LOGIN_BUTTON}
        </button>
      </div>
    );
  }

  const sellerName = String(seller?.userName ?? "").trim() || "продавца";
  const photoUrl = pickUserProfilePhotoUrl(seller);
  const avatarObjectPosition = formatProfileImageObjectPosition(
    getUserAvatarFocus(seller),
  );
  const isSelf = currentUserId != null && String(sellerId) === String(currentUserId);

  const pageTitle = SELLER_PRODUCTS_PAGE_UI.TITLE(sellerName);
  const isPageLoading = profilePhase === "loading" || catalogPhase === "loading";
  const pageError =
    profilePhase === "error"
      ? profileError
      : catalogPhase === "error"
        ? catalogError
        : "";

  if (isPageLoading) {
    return (
      <p className="seller-products-page__state">{SELLER_PRODUCTS_PAGE_UI.LOADING}</p>
    );
  }

  if (pageError) {
    return (
      <p
        className="seller-products-page__state seller-products-page__state_error"
        role="alert"
      >
        {pageError}
      </p>
    );
  }

  const emptyMessage = products.length === 0 ? SELLER_PRODUCTS_PAGE_UI.EMPTY : "";

  return (
    <div className="seller-products-page">
      <header className="seller-products-page__header">
        <button
          type="button"
          className="seller-products-page__back"
          onClick={onBackToCatalog}
        >
          ← {SELLER_PRODUCTS_PAGE_UI.BACK_CATALOG}
        </button>
        <h2 className="seller-products-page__title">{pageTitle}</h2>
        {seller ? (
          <div className="seller-products-page__seller">
            {photoUrl ? (
              <UserPremiumAvatar
                className="seller-products-page__avatar"
                src={photoUrl}
                isPremium={Boolean(seller.isPremiumUser)}
                objectPosition={avatarObjectPosition}
                decoding="async"
              />
            ) : null}
            <p className="seller-products-page__seller-name">
              <UserPremiumDisplayName
                name={sellerName}
                isPremium={Boolean(seller.isPremiumUser)}
                isUserDataConfirmed={Boolean(seller.isUserDataConfirmed)}
              />
            </p>
            {!isSelf ? (
              <UserFollowButton
                targetUserId={String(seller._id)}
                isFollowing={seller.isFollowing === true}
                isAuthorized={isAuthorized}
                isSelf={false}
                onRequestLogin={onRequestLogin}
                onFollowChange={handleFollowChange}
              />
            ) : null}
          </div>
        ) : null}
      </header>
      {emptyMessage ? (
        <p className="seller-products-page__state">{emptyMessage}</p>
      ) : (
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
          catalogSentinelRef={sentinelRef}
          catalogHasMore={hasMore}
          isCatalogLoadingMore={isLoadingMore}
          catalogLoadMoreError={loadMoreError}
          onRetryCatalogLoadMore={() => void retryLoadMore()}
        />
      )}
    </div>
  );
}
