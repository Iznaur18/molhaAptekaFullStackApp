import { useEffect, useMemo, useRef, useState } from "react";

import { buildFeaturedRaffleProgress } from "../../../entities/raffle/lib/buildFeaturedRaffleProgressLabel.js";
import { canSellerEditRaffle } from "../../../entities/raffle/lib/canSellerEditRaffle.js";
import { useRaffleMutations } from "../../../entities/raffle/model/useRaffleMutations.js";
import { useRaffleByIdQuery } from "../../../entities/raffle/model/useRaffleByIdQuery.js";
import { useRaffleProductsQuery } from "../../../entities/raffle/model/useRaffleProductsQuery.js";
import { useFeaturedRafflesQuery } from "../../../entities/raffle/model/useFeaturedRafflesQuery.js";
import { FeaturedRaffleWinnerCard } from "../../../entities/raffle/ui/FeaturedRaffleWinnerCard.jsx";
import { RaffleManageActions } from "../../../entities/raffle/ui/RaffleManageActions.jsx";
import { RafflePrizeMedia } from "../../../entities/raffle/ui/RafflePrizeMedia.jsx";
import { HomeCatalogGrid } from "../../../widgets/catalog-product-grid/ui/HomeCatalogGrid.jsx";
import useEmblaCarousel from "embla-carousel-react";
import {
  API_CLIENT_UI,
  RAFFLE_FEATURED_BANNER_UI,
  RAFFLE_MANAGE_UI,
  RAFFLE_PRODUCTS_PAGE_UI,
} from "../../../shared/config/appUiCopy.js";

import "./RaffleProductsPage.css";

/**
 * @param {{
 *   raffleId: string;
 *   isAuthorized: boolean;
  *   canModerateProducts: boolean;
 *   currentUserId?: string | null;
 *   onRequestLoginAddToCart: () => void;
 *   onSellerNameClick: (userId: string) => void;
 *   onOpenProductDetails: (product: import('../../../entities/product/model/types.js').ProductFromApi) => void;
  *   setRaffleModal: (next: any) => void;
  *   refreshRaffleSurfaces: () => void | Promise<void>;
 * }} props
 */
export function RaffleProductsPage({
  raffleId,
  isAuthorized,
  canModerateProducts,
  currentUserId = null,
  onRequestLoginAddToCart,
  onSellerNameClick,
  onOpenProductDetails,
  setRaffleModal,
  refreshRaffleSurfaces,
}) {
  const [activeRaffleId, setActiveRaffleId] = useState(raffleId);
  useEffect(() => {
    setActiveRaffleId(raffleId);
  }, [raffleId]);

  const featuredRafflesQuery = useFeaturedRafflesQuery({ enabled: true });
  const featuredRaffles = featuredRafflesQuery.data ?? [];

  const raffleQuery = useRaffleByIdQuery({ raffleId: activeRaffleId });
  const productsQuery = useRaffleProductsQuery({ raffleId: activeRaffleId });

  const raffle = raffleQuery.data ?? null;
  const products = productsQuery.data?.products ?? [];
  const isLoading = raffleQuery.isPending || productsQuery.isPending;
  const queryError = raffleQuery.error ?? productsQuery.error;
  const error =
    queryError instanceof Error
      ? queryError.message
      : API_CLIENT_UI.FETCH_RAFFLE_PRODUCTS_FALLBACK;
  const phase = isLoading ? "loading" : queryError ? "error" : "success";
  const progressUi = useMemo(
    () => (raffle ? buildFeaturedRaffleProgress(raffle) : null),
    [raffle],
  );

  const { deleteMyMutation, deleteStaffMutation, pauseMyMutation } = useRaffleMutations();
  const actionsBusy =
    deleteMyMutation.isPending || deleteStaffMutation.isPending || pauseMyMutation.isPending;

  const isOwner =
    currentUserId != null && raffle?.sellerId != null
      ? String(raffle.sellerId) === String(currentUserId)
      : false;

  const canManage = Boolean(raffle) && (isOwner || canModerateProducts);
  const showEdit = isOwner ? canSellerEditRaffle(raffle) : canModerateProducts;
  const showDelete = canManage;
  const showPause = isOwner && raffle?.status === "active";

  const handleEditRaffle = () => {
    if (!raffle) {
      return;
    }
    setRaffleModal({
      mode: "edit",
      raffle,
      useStaffApi: canModerateProducts && !isOwner,
    });
  };

  const handleDeleteRaffle = async () => {
    if (!raffle?._id) {
      return;
    }
    const confirmMessage = isOwner
      ? RAFFLE_MANAGE_UI.DELETE_CONFIRM_OWNER
      : RAFFLE_MANAGE_UI.DELETE_CONFIRM_STAFF;
    if (!window.confirm(confirmMessage)) {
      return;
    }
    try {
      if (isOwner) {
        await deleteMyMutation.mutateAsync(String(raffle._id));
      } else {
        await deleteStaffMutation.mutateAsync(String(raffle._id));
      }
      await refreshRaffleSurfaces();
    } catch (e) {
      // eslint-disable-next-line no-alert
      window.alert(
        e instanceof Error ? e.message : API_CLIENT_UI.DELETE_RAFFLE_FALLBACK,
      );
    }
  };

  const handlePauseRaffle = async () => {
    if (!raffle?._id) {
      return;
    }
    try {
      await pauseMyMutation.mutateAsync(String(raffle._id));
      await refreshRaffleSurfaces();
    } catch (e) {
      // eslint-disable-next-line no-alert
      window.alert(
        e instanceof Error ? e.message : API_CLIENT_UI.PAUSE_RAFFLE_FALLBACK,
      );
    }
  };

  const summaryHeaderContent = (
    <div className="raffle-products-page__copy">
      <p className="raffle-products-page__eyebrow">
        {RAFFLE_PRODUCTS_PAGE_UI.EYEBROW}
      </p>
      <h2 className="raffle-products-page__title">
        {raffle?.title ?? RAFFLE_PRODUCTS_PAGE_UI.TITLE}
      </h2>
      {raffle?.description?.trim() ? (
        <p className="raffle-products-page__header-description">{raffle.description.trim()}</p>
      ) : null}
      {canManage && raffle ? (
        <div className="raffle-products-page__manage">
          <RaffleManageActions
            showEdit={showEdit}
            showDelete={showDelete}
            showPause={showPause}
            onEdit={handleEditRaffle}
            onDelete={handleDeleteRaffle}
            onPause={handlePauseRaffle}
            busy={actionsBusy}
          />
        </div>
      ) : null}
    </div>
  );

  const activeRaffleIdRef = useRef(activeRaffleId);
  useEffect(() => {
    activeRaffleIdRef.current = activeRaffleId;
  }, [activeRaffleId]);

  const carouselRaffles = useMemo(() => {
    // Если текущий raffleId не из featured-списка — показываем только его (без свайпа).
    if (!featuredRaffles?.length) {
      return [];
    }
    return featuredRaffles;
  }, [featuredRaffles]);

  const hasCarousel = carouselRaffles.length > 1;
  const [swipeRef, swipeApi] = useEmblaCarousel(
    { loop: true, align: "start", duration: 200, skipSnaps: false },
    [],
  );
  const [activeSwipeIndex, setActiveSwipeIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState("forward");

  // Синхронизируем activeRaffleId с кареткой свайпа.
  useEffect(() => {
    if (!swipeApi || !hasCarousel) {
      return undefined;
    }
    const index = carouselRaffles.findIndex((r) => String(r._id) === String(activeRaffleId));
    const safeIndex = index < 0 ? 0 : index;
    setActiveSwipeIndex(safeIndex);
    if (index < 0) {
      return undefined;
    }
    swipeApi.scrollTo(safeIndex, true);
    return undefined;
  }, [swipeApi, hasCarousel, carouselRaffles, activeRaffleId]);

  useEffect(() => {
    if (!swipeApi || !hasCarousel) {
      return undefined;
    }

    const onSelect = () => {
      const idx = swipeApi.selectedScrollSnap();
      setSwipeDirection(idx >= activeSwipeIndexRef.current ? "forward" : "backward");
      setActiveSwipeIndex(idx);
      const next = carouselRaffles[idx] ?? null;
      const nextId = next?._id ? String(next._id) : null;
      if (!nextId) {
        return;
      }
      if (nextId === String(activeRaffleIdRef.current)) {
        return;
      }
      setActiveRaffleId(nextId);
    };

    swipeApi.on("select", onSelect);
    return () => {
      swipeApi.off("select", onSelect);
    };
  }, [swipeApi, hasCarousel, carouselRaffles]);
  const activeSwipeIndexRef = useRef(activeSwipeIndex);
  useEffect(() => {
    activeSwipeIndexRef.current = activeSwipeIndex;
  }, [activeSwipeIndex]);

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
      <div className="raffle-products-page__summary-layout">
        <div className="raffle-products-page__hero">
          <div className="raffle-products-page__media">
            {raffle ? (
              <RafflePrizeMedia
                raffle={raffle}
                className="raffle-products-page__media-el"
                autoplayVideo={true}
                showSoundToggle={true}
                blurVideoBackground={true}
              />
            ) : null}

            {hasCarousel ? (
              <div
                className="raffle-products-page__swipe-dots"
                role="tablist"
                aria-label="Свайп розыгрыша"
              >
                {carouselRaffles.map((r, idx) => {
                  const isActive = idx === activeSwipeIndex;
                  return (
                    <button
                      key={String(r._id)}
                      type="button"
                      className={[
                        "raffle-products-page__swipe-dot",
                        isActive
                          ? "raffle-products-page__swipe-dot_active"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      aria-selected={isActive}
                      onClick={() => {
                        if (!swipeApi) {
                          return;
                        }
                        swipeApi.scrollTo(idx, true);
                      }}
                    />
                  );
                })}
              </div>
            ) : null}
          </div>

          {hasCarousel ? (
            <div
              className="raffle-products-page__swipe-overlay"
              ref={swipeRef}
              aria-hidden="true"
            >
              <div className="raffle-products-page__swipe-track">
                {carouselRaffles.map((r) => (
                  <div key={String(r._id)} className="raffle-products-page__swipe-slide" />
                ))}
              </div>
            </div>
          ) : null}

          <header className="raffle-products-page__header raffle-products-page__header_mobile">
            {summaryHeaderContent}
          </header>
        </div>

        {progressUi ? (
          <div
            key={`progress-${activeRaffleId}`}
            className={[
              "raffle-products-page__content-anim",
              "raffle-products-page__summary-side",
              swipeDirection === "backward"
                ? "raffle-products-page__content-anim_backward"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <section
              className="raffle-products-page__progress"
              aria-label={progressUi.label}
            >
              <div
                className={[
                  "raffle-products-page__progress-bar",
                  progressUi.isCompleted
                    ? "raffle-products-page__progress-bar_completed"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={progressUi.target}
                aria-valuenow={progressUi.progress}
              >
                <div
                  className={[
                    "raffle-products-page__progress-fill",
                    progressUi.isCompleted
                      ? "raffle-products-page__progress-fill_completed"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{ width: `${progressUi.percent}%` }}
                />
              </div>

              {progressUi.isCompleted && raffle?.winner?._id ? (
                <FeaturedRaffleWinnerCard winner={raffle.winner} />
              ) : null}

              <div className="raffle-products-page__stats">
                <div className="raffle-products-page__stat raffle-products-page__stat_accent">
                  <span className="raffle-products-page__stat-label">
                    {RAFFLE_FEATURED_BANNER_UI.STAT_SOLD}
                  </span>
                  <strong className="raffle-products-page__stat-value">
                    {RAFFLE_FEATURED_BANNER_UI.STAT_SOLD_VALUE(
                      progressUi.progress,
                      progressUi.target,
                    )}
                  </strong>
                </div>
                <div className="raffle-products-page__stat">
                  <span className="raffle-products-page__stat-label">
                    {RAFFLE_FEATURED_BANNER_UI.STAT_PARTICIPANTS}
                  </span>
                  <strong className="raffle-products-page__stat-value">
                    {progressUi.participantsCount}
                  </strong>
                </div>
                <div className="raffle-products-page__stat">
                  <span className="raffle-products-page__stat-label">
                    {RAFFLE_FEATURED_BANNER_UI.STAT_GOAL}
                  </span>
                  <strong className="raffle-products-page__stat-value">
                    {progressUi.target}
                  </strong>
                </div>
              </div>
            </section>

            <header className="raffle-products-page__header raffle-products-page__header_desktop">
              {summaryHeaderContent}
            </header>

            {raffle?.description?.trim() ? (
              <p className="raffle-products-page__summary-description-desktop">
                {raffle.description.trim()}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {raffle?.description?.trim() ? (
        <p className="raffle-products-page__description raffle-products-page__description_desktop-hidden">
          {raffle.description.trim()}
        </p>
      ) : null}

      <div
        key={`products-${activeRaffleId}`}
        className={[
          "raffle-products-page__content-anim",
          "raffle-products-page__products-block",
          swipeDirection === "backward"
            ? "raffle-products-page__content-anim_backward"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {canManage && raffle ? (
          <div className="raffle-products-page__manage-desktop">
            <RaffleManageActions
              showEdit={showEdit}
              showDelete={showDelete}
              showPause={showPause}
              onEdit={handleEditRaffle}
              onDelete={handleDeleteRaffle}
              onPause={handlePauseRaffle}
              busy={actionsBusy}
            />
          </div>
        ) : null}

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
    </div>
  );
}
