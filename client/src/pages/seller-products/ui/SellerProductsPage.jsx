import { useCallback, useEffect, useMemo, useState } from "react";

import { fetchUserProfileById } from "../../../entities/user/api/fetchUserProfileById.js";
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
import { HomeCatalogGrid } from "../../home/ui/HomeCatalogGrid.jsx";
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
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [backgroundLoadFailed, setBackgroundLoadFailed] = useState(false);

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
