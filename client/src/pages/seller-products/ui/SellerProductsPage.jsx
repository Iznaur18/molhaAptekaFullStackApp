import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

import { userProfileQueryKeys } from "../../../entities/user/model/userProfileQueryKeys.js";
import { useUserProfileQuery } from "../../../entities/user/model/useUserProfileQuery.js";
import { pickUserProfilePhotoUrl } from "../../../entities/user/lib/pickUserProfilePhotoUrl.js";
import {
  formatProfileImageObjectPosition,
  getUserAvatarFocus,
  getUserBackgroundFocus,
} from "../../../entities/user/lib/profileImageFocus.js";
import { resolveUserProfileBackgroundFromUser } from "../../../entities/user/lib/userBackgroundValue.js";
import { UserFollowButton } from "../../../entities/user-follow/ui/UserFollowButton.jsx";
import { UserPremiumAvatar } from "../../../entities/user/ui/UserPremiumAvatar.jsx";
import { UserPremiumDisplayName } from "../../../entities/user/ui/UserPremiumDisplayName.jsx";
import { HomeCatalogGrid } from "../../../widgets/catalog-product-grid/ui/HomeCatalogGrid.jsx";
import { useSellerProductsCatalog } from "../model/useSellerProductsCatalog.js";
import { SELLER_PRODUCTS_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import "../../../entities/user/ui/UserDetailsModal.css";
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
  onGoToMyProducts,
}) {
  const queryClient = useQueryClient();
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [backgroundLoadFailed, setBackgroundLoadFailed] = useState(false);

  const catalogEnabled = isSessionReady;
  const profileQuery = useUserProfileQuery({ userId: sellerId, enabled: catalogEnabled });
  const seller = profileQuery.data ?? null;
  const profilePhase = !catalogEnabled
    ? "idle"
    : profileQuery.isPending
      ? "loading"
      : profileQuery.isError
        ? "error"
        : "success";
  const profileError =
    profileQuery.error instanceof Error
      ? profileQuery.error.message
      : SELLER_PRODUCTS_PAGE_UI.FETCH_PROFILE_FALLBACK;

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

  useEffect(() => {
    if (currentUserId != null && String(sellerId) === String(currentUserId)) {
      onGoToMyProducts();
    }
  }, [currentUserId, onGoToMyProducts, sellerId]);

  useEffect(() => {
    setAvatarLoadFailed(false);
    setBackgroundLoadFailed(false);
  }, [seller?._id]);

  const photoUrl = pickUserProfilePhotoUrl(seller);
  const avatarObjectPosition = useMemo(
    () => formatProfileImageObjectPosition(getUserAvatarFocus(seller)),
    [seller],
  );
  const backgroundObjectPosition = useMemo(
    () => formatProfileImageObjectPosition(getUserBackgroundFocus(seller)),
    [seller],
  );
  const profileBackground = seller ? resolveUserProfileBackgroundFromUser(seller) : null;
  const canShowBackground =
    Boolean(profileBackground) &&
    (profileBackground.kind === "preset" ||
      (profileBackground.kind === "image" && !backgroundLoadFailed));
  const showProfileBanner =
    Boolean(seller) && (canShowBackground || (Boolean(photoUrl) && !avatarLoadFailed));

  const handleFollowChange = useCallback(
    (/** @type {{ isFollowing: boolean }} */ patch) => {
      queryClient.setQueryData(userProfileQueryKeys.byId(sellerId), (old) => {
        if (!old) {
          return old;
        }
        return { ...old, isFollowing: patch.isFollowing };
      });
    },
    [queryClient, sellerId],
  );

  if (!isSessionReady) {
    return (
      <p className="seller-products-page__state">{SELLER_PRODUCTS_PAGE_UI.LOADING}</p>
    );
  }

  const sellerName = String(seller?.userName ?? "").trim() || "продавца";
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
        <h2 className="seller-products-page__title">{pageTitle}</h2>
        {seller ? (
          <div className="seller-products-page__seller">
            {showProfileBanner ? (
              <div
                className={
                  canShowBackground
                    ? "user-details-modal__banner user-details-modal__banner_has-bg"
                    : "user-details-modal__banner"
                }
              >
                {canShowBackground && profileBackground?.kind === "image" ? (
                  <img
                    className="user-details-modal__banner-image"
                    src={profileBackground.url}
                    alt=""
                    decoding="async"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    style={{ objectPosition: backgroundObjectPosition }}
                    onError={() => setBackgroundLoadFailed(true)}
                  />
                ) : null}
                {canShowBackground && profileBackground?.kind === "preset" ? (
                  <div
                    className="user-details-modal__banner-color"
                    style={{ backgroundColor: profileBackground.color }}
                    aria-hidden="true"
                  />
                ) : null}
                {photoUrl && !avatarLoadFailed ? (
                  <UserPremiumAvatar
                    className="user-details-modal__avatar user-details-modal__avatar_lead user-details-modal__avatar_on-banner"
                    src={photoUrl}
                    isPremium={Boolean(seller.isPremiumUser)}
                    objectPosition={avatarObjectPosition}
                    decoding="async"
                    onError={() => setAvatarLoadFailed(true)}
                  />
                ) : null}
              </div>
            ) : null}
            <div className="seller-products-page__seller-meta">
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
