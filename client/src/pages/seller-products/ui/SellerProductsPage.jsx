import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

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
import { SellerProfileQuickStats } from "../../../entities/user/ui/SellerProfileQuickStats.jsx";
import { SellerShareLinkButton } from "../../../entities/user/ui/SellerShareLinkButton.jsx";
import { usePublicSellerShelvesQuery } from "../../../entities/seller-shelf/model/usePublicSellerShelvesQuery.js";
import { HomeCatalogGrid } from "../../../widgets/catalog-product-grid/ui/HomeCatalogGrid.jsx";
import { useSellerProductsCatalog } from "../model/useSellerProductsCatalog.js";
import {
  PRODUCT_CARD_UI,
  SELLER_PRODUCTS_PAGE_UI,
  USER_LIST_ROW_UI,
} from "../../../shared/config/appUiCopy.js";
import { AppIcon } from "../../../shared/ui/icon/index.js";

import "../../../entities/user/ui/UserDetailsModal.css";
import "./SellerProductsPage.css";

function navigateBackOrHome(navigate) {
  if (typeof window !== "undefined" && window.history.length > 1) {
    navigate(-1);
    return;
  }
  navigate("/", { replace: true });
}

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
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [backgroundLoadFailed, setBackgroundLoadFailed] = useState(false);
  const [selectedShelfId, setSelectedShelfId] = useState(/** @type {string | null} */ (null));

  const catalogEnabled = isSessionReady;
  const profileQuery = useUserProfileQuery({ userId: sellerId, enabled: catalogEnabled });
  const shelvesQuery = usePublicSellerShelvesQuery({
    sellerId,
    enabled: catalogEnabled,
  });
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
  } = useSellerProductsCatalog({
    sellerId,
    enabled: catalogEnabled,
    shelfId: selectedShelfId,
  });

  useEffect(() => {
    setSelectedShelfId(null);
  }, [sellerId]);

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

  const handleSellerProfileClick = useCallback(() => {
    onSellerNameClick?.(sellerId);
  }, [onSellerNameClick, sellerId]);

  if (!isSessionReady) {
    return (
      <p className="seller-products-page__state">{SELLER_PRODUCTS_PAGE_UI.LOADING}</p>
    );
  }

  const displayName =
    String(seller?.userName ?? "").trim() || USER_LIST_ROW_UI.MISSING_NAME;
  const isSelf = currentUserId != null && String(sellerId) === String(currentUserId);
  const isPageLoading = profilePhase === "loading" || catalogPhase === "loading";
  const pageError =
    profilePhase === "error"
      ? profileError
      : catalogPhase === "error"
        ? catalogError
        : "";

  if (isPageLoading) {
    return (
      <div className="seller-products-page">
        <p className="seller-products-page__state">{SELLER_PRODUCTS_PAGE_UI.LOADING}</p>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="seller-products-page">
        <p
          className="seller-products-page__state seller-products-page__state_error"
          role="alert"
        >
          {pageError}
        </p>
      </div>
    );
  }

  const emptyMessage = products.length === 0 ? SELLER_PRODUCTS_PAGE_UI.EMPTY : "";

  return (
    <div className="seller-products-page">
      {/* Паритет mobile Stack.Screen title: "Товары продавца" */}
      <header className="seller-products-page__nav">
        <button
          type="button"
          className="seller-products-page__back"
          aria-label={SELLER_PRODUCTS_PAGE_UI.BACK_ARIA}
          onClick={() => navigateBackOrHome(navigate)}
        >
          <AppIcon icon={ChevronLeft} size="md" strokeWidth={2.25} />
        </button>
        <h1 className="seller-products-page__nav-title">{SELLER_PRODUCTS_PAGE_UI.TITLE}</h1>
      </header>

      {seller ? (
        <div className="seller-products-page__header">
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
              {isSelf ? (
                <SellerShareLinkButton
                  sellerId={sellerId}
                  sellerName={displayName}
                  variant="banner"
                />
              ) : null}
            </div>
          ) : null}

          <SellerProfileQuickStats
            seller={seller}
            userId={sellerId}
            hidePhoneUntilReveal={!isSelf}
          />

          <div className="seller-products-page__seller-meta">
            <button
              type="button"
              className="seller-products-page__seller-name"
              aria-label={PRODUCT_CARD_UI.SELLER_PROFILE_ARIA(displayName)}
              onClick={handleSellerProfileClick}
            >
              <UserPremiumDisplayName
                name={displayName}
                isPremium={Boolean(seller.isPremiumUser)}
                isUserDataConfirmed={Boolean(seller.isUserDataConfirmed)}
              />
            </button>
            {isSelf && !showProfileBanner ? (
              <SellerShareLinkButton
                sellerId={sellerId}
                sellerName={displayName}
                variant="meta"
              />
            ) : null}
            {!isSelf ? (
              <div className="seller-products-page__seller-actions">
                <SellerShareLinkButton
                  sellerId={sellerId}
                  sellerName={displayName}
                  variant="meta"
                />
                <UserFollowButton
                  targetUserId={String(seller._id)}
                  isFollowing={seller.isFollowing === true}
                  isAuthorized={isAuthorized}
                  isSelf={false}
                  onRequestLogin={onRequestLogin}
                  onFollowChange={handleFollowChange}
                />
              </div>
            ) : null}
          </div>

          {(shelvesQuery.data?.shelves?.length ?? 0) > 0 ? (
            <div
              className="seller-products-page__shelves"
              role="toolbar"
              aria-label={SELLER_PRODUCTS_PAGE_UI.SHELF_FILTER_ARIA}
            >
              <button
                type="button"
                className={[
                  "seller-products-page__shelf-chip",
                  selectedShelfId == null
                    ? "seller-products-page__shelf-chip--active"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-pressed={selectedShelfId == null}
                onClick={() => setSelectedShelfId(null)}
              >
                {SELLER_PRODUCTS_PAGE_UI.SHELF_FILTER_ALL}
              </button>
              {(shelvesQuery.data?.shelves ?? []).map((shelf) => (
                <button
                  key={shelf._id}
                  type="button"
                  className={[
                    "seller-products-page__shelf-chip",
                    selectedShelfId === shelf._id
                      ? "seller-products-page__shelf-chip--active"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-pressed={selectedShelfId === shelf._id}
                  onClick={() => setSelectedShelfId(shelf._id)}
                >
                  {shelf.name}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

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
