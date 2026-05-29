import { useMemo, useState } from "react";

import { formatRafflePrizeImageObjectPosition } from "../lib/rafflePrizeImageFocus.js";
import { resolveRafflePrizeImageUrl } from "../lib/resolveRafflePrizeImageUrl.js";
import { RAFFLE_FEATURED_BANNER_UI } from "../../../shared/config/appUiCopy.js";
import { RaffleDescriptionModal } from "./RaffleDescriptionModal.jsx";
import { RaffleManageActions } from "./RaffleManageActions.jsx";

import "./RaffleFeaturedBanner.css";

/**
 * @param {{
 *   raffle: import('../model/types.js').RaffleFromApi;
 *   onOpenProducts: (raffleId: string) => void;
 *   manage?: {
 *     showEdit?: boolean;
 *     showDelete?: boolean;
 *     showPause?: boolean;
 *     onEdit?: () => void;
 *     onDelete?: () => void;
 *     onPause?: () => void;
 *     busy?: boolean;
 *   } | null;
 *   carouselVisualDrag?: {
 *     onPointerDown: (event: import('react').PointerEvent<HTMLDivElement>) => void;
 *     onPointerMove: (event: import('react').PointerEvent<HTMLDivElement>) => void;
 *     onPointerUp: (event: import('react').PointerEvent<HTMLDivElement>) => void;
 *     onPointerCancel: (event: import('react').PointerEvent<HTMLDivElement>) => void;
 *     isDragging?: boolean;
 *   } | null;
 * }} props
 */
export function RaffleFeaturedBanner({
  raffle,
  onOpenProducts,
  manage = null,
  carouselVisualDrag = null,
}) {
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const progress = Number(raffle.salesProgress) || 0;
  const target = Number(raffle.targetSales) || 0;
  const percent =
    target > 0 ? Math.min(100, Math.round((progress / target) * 100)) : 0;
  const isCompleted = raffle.status === "completed";
  const remaining = Math.max(0, target - progress);
  const hasManage =
    manage &&
    (manage.showEdit || manage.showDelete || manage.showPause);

  const sectionClassName = isCompleted
    ? "raffle-featured-banner raffle-featured-banner_completed"
    : "raffle-featured-banner";
  const prizeImageSrc = useMemo(
    () => resolveRafflePrizeImageUrl(raffle),
    [raffle],
  );
  const prizeImageObjectPosition = useMemo(
    () => formatRafflePrizeImageObjectPosition(raffle),
    [raffle],
  );

  return (
    <section className={sectionClassName} aria-label={raffle.title}>
      <div className="raffle-featured-banner__inner">
        <div
          className={[
            "raffle-featured-banner__visual",
            carouselVisualDrag
              ? "raffle-featured-banner__visual_carousel-drag"
              : "",
            carouselVisualDrag?.isDragging
              ? "raffle-featured-banner__visual_carousel-dragging"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onPointerDown={carouselVisualDrag?.onPointerDown}
          onPointerMove={carouselVisualDrag?.onPointerMove}
          onPointerUp={carouselVisualDrag?.onPointerUp}
          onPointerCancel={carouselVisualDrag?.onPointerCancel}
        >
          <img
            src={prizeImageSrc}
            alt=""
            className="raffle-featured-banner__prize-image"
            loading="lazy"
            style={{ objectPosition: prizeImageObjectPosition }}
          />
          <span className="raffle-featured-banner__badge">
            {RAFFLE_FEATURED_BANNER_UI.BADGE}
          </span>
        </div>
        <div className="raffle-featured-banner__body">
          <h2 className="raffle-featured-banner__title">{raffle.title}</h2>
          {raffle.description ? (
            <button
              type="button"
              className="raffle-featured-banner__description"
              onClick={() => setIsDescriptionOpen(true)}
              aria-label={RAFFLE_FEATURED_BANNER_UI.DESCRIPTION_OPEN_ARIA}
            >
              {raffle.description}
            </button>
          ) : null}
          <div className="raffle-featured-banner__progress-wrap">
            <div
              className="raffle-featured-banner__progress-bar"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={target}
            >
              <span
                className="raffle-featured-banner__progress-fill"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="raffle-featured-banner__progress-label">
              {RAFFLE_FEATURED_BANNER_UI.PROGRESS(progress, target)}
              {!isCompleted && remaining > 0
                ? ` · ${RAFFLE_FEATURED_BANNER_UI.REMAINING(remaining)}`
                : ""}
            </p>
          </div>
          {hasManage ? (
            <RaffleManageActions
              className="raffle-featured-banner__manage"
              showEdit={manage.showEdit}
              showDelete={manage.showDelete}
              showPause={manage.showPause}
              onEdit={manage.onEdit}
              onDelete={manage.onDelete}
              onPause={manage.onPause}
              busy={manage.busy}
            />
          ) : null}
          <div className="raffle-featured-banner__actions">
            <button
              type="button"
              className="raffle-featured-banner__btn raffle-featured-banner__btn_primary"
              onClick={() => onOpenProducts(raffle._id)}
            >
              {RAFFLE_FEATURED_BANNER_UI.OPEN_PRODUCTS}
            </button>
            {isCompleted && raffle.instagramUrl ? (
              <a
                href={raffle.instagramUrl}
                className="raffle-featured-banner__btn raffle-featured-banner__btn_instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                {RAFFLE_FEATURED_BANNER_UI.OPEN_INSTAGRAM}
              </a>
            ) : null}
            {isCompleted ? (
              <span className="raffle-featured-banner__completed">
                {RAFFLE_FEATURED_BANNER_UI.COMPLETED}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <RaffleDescriptionModal
        isOpen={isDescriptionOpen}
        title={raffle.title}
        description={raffle.description ?? ""}
        onClose={() => setIsDescriptionOpen(false)}
      />
    </section>
  );
}
