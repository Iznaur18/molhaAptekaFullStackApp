import { useMemo, useState } from "react";

import { RAFFLE_FEATURED_BANNER_UI } from "../../../shared/config/appUiCopy.js";
import { getRaffleFeaturedBannerBackdrop } from "../lib/getRaffleFeaturedBannerBackdrop.js";
import { RaffleDescriptionModal } from "./RaffleDescriptionModal.jsx";
import { RaffleManageActions } from "./RaffleManageActions.jsx";
import { RafflePrizeMedia } from "./RafflePrizeMedia.jsx";

import "./RaffleFeaturedBanner.css";

const stopCarouselDrag = (event) => {
  event.stopPropagation();
};

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
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const progress = Number(raffle.salesProgress) || 0;
  const target = Number(raffle.targetSales) || 0;
  const percent = target > 0 ? Math.min(100, Math.round((progress / target) * 100)) : 0;
  const isCompleted = raffle.status === "completed";
  const remaining = Math.max(0, target - progress);
  const hasManage =
    manage && (manage.showEdit || manage.showDelete || manage.showPause);

  const sectionClassName = isCompleted
    ? "raffle-featured-banner raffle-featured-banner_completed"
    : "raffle-featured-banner";

  const backdrop = useMemo(() => getRaffleFeaturedBannerBackdrop(raffle), [raffle]);

  const innerClassName = [
    "raffle-featured-banner__inner",
    backdrop.hasBackdrop ? "raffle-featured-banner__inner_has-backdrop" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const prizeMedia = useMemo(
    () => (
      <RafflePrizeMedia
        raffle={raffle}
        className="raffle-featured-banner__prize-image"
        imageClassName="raffle-featured-banner__prize-image"
        videoClassName="raffle-featured-banner__prize-image raffle-featured-banner__prize-video"
        autoplayVideo
        showSoundToggle
      />
    ),
    [raffle],
  );

  const handleInfoToggle = () => {
    setIsInfoOpen((open) => !open);
  };

  return (
    <section className={sectionClassName} aria-label={raffle.title}>
      <div className={innerClassName} style={backdrop.style}>
        {backdrop.useVideoBackdrop ? (
          <div className="raffle-featured-banner__backdrop" aria-hidden="true">
            <RafflePrizeMedia
              raffle={raffle}
              className="raffle-featured-banner__backdrop-media"
              imageClassName="raffle-featured-banner__backdrop-media"
              videoClassName="raffle-featured-banner__backdrop-media raffle-featured-banner__backdrop-video"
              autoplayVideo
              showSoundToggle={false}
            />
          </div>
        ) : null}
        <div
          className={[
            "raffle-featured-banner__visual",
            carouselVisualDrag ? "raffle-featured-banner__visual_carousel-drag" : "",
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
          {prizeMedia}
          <button
            type="button"
            className={[
              "raffle-featured-banner__info-toggle",
              isInfoOpen ? "raffle-featured-banner__info-toggle_open" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-expanded={isInfoOpen}
            aria-controls={`raffle-featured-banner-info-${raffle._id}`}
            aria-label={
              isInfoOpen
                ? RAFFLE_FEATURED_BANNER_UI.INFO_TOGGLE_CLOSE_ARIA
                : RAFFLE_FEATURED_BANNER_UI.INFO_TOGGLE_OPEN_ARIA
            }
            onClick={handleInfoToggle}
            onPointerDown={stopCarouselDrag}
          >
            !
          </button>
          <div
            id={`raffle-featured-banner-info-${raffle._id}`}
            className={[
              "raffle-featured-banner__info-panel",
              isInfoOpen ? "raffle-featured-banner__info-panel_open" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-hidden={!isInfoOpen}
            onPointerDown={stopCarouselDrag}
          >
            <h2 className="raffle-featured-banner__info-title">{raffle.title}</h2>
            {raffle.description ? (
              <p className="raffle-featured-banner__info-description">{raffle.description}</p>
            ) : null}
          </div>
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
