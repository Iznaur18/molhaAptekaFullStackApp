import { useMemo } from "react";

import { buildFeaturedRaffleProgress } from "../../../entities/raffle/lib/buildFeaturedRaffleProgressLabel.js";
import { useRaffleByIdQuery } from "../../../entities/raffle/model/useRaffleByIdQuery.js";
import { useRaffleProductsQuery } from "../../../entities/raffle/model/useRaffleProductsQuery.js";
import { FeaturedRaffleWinnerCard } from "../../../entities/raffle/ui/FeaturedRaffleWinnerCard.jsx";
import { RafflePrizeMedia } from "../../../entities/raffle/ui/RafflePrizeMedia.jsx";
import { HomeCatalogGrid } from "../../../widgets/catalog-product-grid/ui/HomeCatalogGrid.jsx";
import {
  API_CLIENT_UI,
  RAFFLE_FEATURED_BANNER_UI,
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
 * }} props
 */
export function RaffleProductsPage({
  raffleId,
  isAuthorized,
  currentUserId = null,
  onRequestLoginAddToCart,
  onSellerNameClick,
  onOpenProductDetails,
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
  const progressUi = useMemo(
    () => (raffle ? buildFeaturedRaffleProgress(raffle) : null),
    [raffle],
  );

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
        <div className="raffle-products-page__media">
          {raffle ? (
            <RafflePrizeMedia
              raffle={raffle}
              className="raffle-products-page__media-el"
              autoplayVideo={false}
              showSoundToggle={false}
            />
          ) : null}
        </div>
        <div className="raffle-products-page__copy">
          <p className="raffle-products-page__eyebrow">
            {RAFFLE_PRODUCTS_PAGE_UI.EYEBROW}
          </p>
          <h2 className="raffle-products-page__title">
            {raffle?.title ?? RAFFLE_PRODUCTS_PAGE_UI.TITLE}
          </h2>
        </div>
      </header>

      {raffle?.description?.trim() ? (
        <p className="raffle-products-page__description">
          {raffle.description.trim()}
        </p>
      ) : null}

      {progressUi ? (
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
  );
}
