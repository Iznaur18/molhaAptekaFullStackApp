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
import { isSellerSafeDealApproved } from "@molha/api-contract";

import { UserPremiumDisplayName } from "../../../entities/user/ui/UserPremiumDisplayName.jsx";
import { SellerProfileQuickStats } from "../../../entities/user/ui/SellerProfileQuickStats.jsx";
import { SellerShareLinkButton } from "../../../entities/user/ui/SellerShareLinkButton.jsx";
import { usePublicSellerShelvesQuery } from "../../../entities/seller-shelf/model/usePublicSellerShelvesQuery.js";
import { usePublicSellerOneCShelvesQuery } from "../../../entities/seller-shelf/model/usePublicSellerOneCShelvesQuery.js";
import { HomeCatalogGrid } from "../../../widgets/catalog-product-grid/ui/HomeCatalogGrid.jsx";
import { useSellerProductsCatalog } from "../model/useSellerProductsCatalog.js";
import {
  PRODUCT_CARD_UI,
  SELLER_PRODUCTS_PAGE_UI,
  USER_LIST_ROW_UI,
} from "../../../shared/config/appUiCopy.js";
import { AppIcon } from "../../../shared/ui/icon/index.js";
import { SellerProductsPageSkeleton } from "./SellerProductsPageSkeleton.jsx";

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
  const [selectedShelfId, setSelectedShelfId] = useState(
    /** @type {string | null} */ (null),
  );
  /**
   * Путь по категориям 1С: [корень, подкатегория, …]. Дерево в выгрузке
   * бывает глубже двух уровней, поэтому храним не пару, а путь целиком.
   */
  const [onecPath, setOnecPath] = useState(/** @type {string[]} */ ([]));
  // Товары — по самой глубокой выбранной категории вместе с её вложенными.
  const selectedOnecGroupId =
    onecPath.length > 0 ? onecPath[onecPath.length - 1] : null;

  const catalogEnabled = isSessionReady;
  const profileQuery = useUserProfileQuery({
    userId: sellerId,
    enabled: catalogEnabled,
  });
  const shelvesQuery = usePublicSellerShelvesQuery({
    sellerId,
    enabled: catalogEnabled,
  });
  // Полки из 1С стоят в том же ряду: покупателю всё равно, откуда они взялись.
  const onecShelvesQuery = usePublicSellerOneCShelvesQuery({
    sellerId,
    enabled: catalogEnabled,
  });
  /** @type {Array<{ id: string; name: string; children: any[] }>} */
  const onecShelves = onecShelvesQuery.data ?? [];
  /**
   * Ряды категорий: корни, затем дети каждой выбранной по пути. Последний ряд
   * рисуется, только если у выбранной категории есть вложенные.
   *
   * @type {Array<{ level: number; parentName: string; items: any[] }>}
   */
  const onecRows = [];
  {
    let level = 0;
    let items = onecShelves;
    let parentName = "";
    while (items.length > 0) {
      onecRows.push({ level, parentName, items });
      const selectedId = onecPath[level];
      const selected = selectedId ? items.find((item) => item.id === selectedId) : null;
      if (!selected) break;
      items = selected.children ?? [];
      parentName = selected.name;
      level += 1;
    }
  }
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
    onecGroupId: selectedOnecGroupId,
  });

  useEffect(() => {
    setSelectedShelfId(null);
    setOnecPath([]);
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
  const profileBackground = seller
    ? resolveUserProfileBackgroundFromUser(seller)
    : null;
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

  // Ожидание сессии визуально ничем не отличается от загрузки данных —
  // показываем тот же скелетон, иначе экран дважды меняет вид.
  if (!isSessionReady) {
    return <SellerProductsPageSkeleton />;
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
    return <SellerProductsPageSkeleton />;
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
        <h1 className="seller-products-page__nav-title">
          {SELLER_PRODUCTS_PAGE_UI.TITLE}
        </h1>
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
                hasSafeDeal={isSellerSafeDealApproved(seller)}
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

          {(shelvesQuery.data?.shelves?.length ?? 0) > 0 || onecShelves.length > 0 ? (
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
                aria-pressed={selectedShelfId == null && onecPath.length === 0}
                onClick={() => {
                  setSelectedShelfId(null);
                  setOnecPath([]);
                }}
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
                  onClick={() => {
                    setSelectedShelfId(shelf._id);
                    setOnecPath([]);
                  }}
                >
                  {shelf.name}
                </button>
              ))}
              {onecShelves.map((shelf) => (
                <button
                  key={shelf.id}
                  type="button"
                  className={[
                    "seller-products-page__shelf-chip",
                    onecPath[0] === shelf.id
                      ? "seller-products-page__shelf-chip--active"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-pressed={onecPath[0] === shelf.id}
                  onClick={() => {
                    setSelectedShelfId(null);
                    setOnecPath(onecPath[0] === shelf.id ? [] : [shelf.id]);
                  }}
                >
                  {shelf.name}
                </button>
              ))}
            </div>
          ) : null}

          {/* Вложенные уровни: по ряду на каждую открытую категорию. Товары
              всей ветки видны сразу, поэтому «Все» здесь — вся категория. */}
          {onecRows.slice(1).map((row) => (
            <div
              key={`onec-level-${row.level}`}
              className="seller-products-page__shelves seller-products-page__shelves--nested"
              role="toolbar"
              aria-label={row.parentName}
            >
              <button
                type="button"
                className={[
                  "seller-products-page__shelf-chip",
                  onecPath.length === row.level
                    ? "seller-products-page__shelf-chip--active"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-pressed={onecPath.length === row.level}
                onClick={() => setOnecPath(onecPath.slice(0, row.level))}
              >
                {SELLER_PRODUCTS_PAGE_UI.SHELF_FILTER_ALL}
              </button>
              {row.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={[
                    "seller-products-page__shelf-chip",
                    onecPath[row.level] === item.id
                      ? "seller-products-page__shelf-chip--active"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-pressed={onecPath[row.level] === item.id}
                  onClick={() =>
                    setOnecPath(
                      onecPath[row.level] === item.id
                        ? onecPath.slice(0, row.level)
                        : [...onecPath.slice(0, row.level), item.id],
                    )
                  }
                >
                  {item.name}
                </button>
              ))}
            </div>
          ))}
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
