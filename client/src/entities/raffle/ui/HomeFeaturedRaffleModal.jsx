import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  RAFFLE_FEATURED_BANNER_UI,
  RAFFLE_FEATURED_CAROUSEL_UI,
} from "../../../shared/config/appUiCopy.js";
import { useDialogFocusTrap } from "../../../shared/lib/useDialogFocusTrap.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import { useHomeFeaturedRaffleModalAnimation } from "../model/useHomeFeaturedRaffleModalAnimation.js";
import { FeaturedRaffleModalCard } from "./FeaturedRaffleModalCard.jsx";

import "./HomeFeaturedRaffleModal.css";

const VISUAL_SIZE_RATIO = 0.94;
/** `.home-featured-raffle-modal__scroll` padding-bottom */
const SCROLL_PAD_BOTTOM_PX = 16;

/**
 * @param {{
 *   visible: boolean;
 *   raffles: import('../model/types.js').RaffleFromApi[];
 *   onClose: () => void;
 *   onOpenProducts: (raffleId: string) => void;
 *   getManage?: (raffle: import('../model/types.js').RaffleFromApi) => object | null;
 * }} props
 */
export function HomeFeaturedRaffleModal({
  visible,
  raffles,
  onClose,
  onOpenProducts,
  getManage,
}) {
  const dialogRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const footerRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const closeButtonRef = useRef(/** @type {HTMLButtonElement | null} */ (null));
  const { mounted, isVisible } = useHomeFeaturedRaffleModalAnimation(visible);
  const [dialogMetrics, setDialogMetrics] = useState({
    width: 0,
    height: 0,
    footerHeight: 0,
  });
  const [activeIndex, setActiveIndex] = useState(0);

  const slideCount = raffles.length;
  const cardWidth = Math.max(0, dialogMetrics.width);
  const maxVisualByWidth = Math.round(cardWidth * VISUAL_SIZE_RATIO);
  const maxVisualByHeight = Math.max(
    0,
    dialogMetrics.height - dialogMetrics.footerHeight - SCROLL_PAD_BOTTOM_PX,
  );
  const visualSize =
    maxVisualByWidth > 0 && maxVisualByHeight > 0
      ? Math.min(maxVisualByWidth, maxVisualByHeight)
      : maxVisualByWidth;
  const sideInsetPx = Math.max(0, Math.round((cardWidth - visualSize) / 2));
  const roomAbovePx = Math.max(0, maxVisualByHeight - visualSize);
  const visualInsetPx = Math.min(sideInsetPx, roomAbovePx);
  const activeRaffle = raffles[activeIndex] ?? raffles[0] ?? null;
  const isInteractive = visible && isVisible;
  const hasCarousel = slideCount > 1;

  const autoplayRef = useRef(
    Autoplay({
      delay: RAFFLE_FEATURED_CAROUSEL_UI.AUTOPLAY_MS,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    }),
  );
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "center", duration: 50 },
    hasCarousel ? [autoplayRef.current] : [],
  );

  useScrollLock(mounted);
  useDialogFocusTrap(dialogRef, {
    active: isInteractive,
    initialFocusRef: closeButtonRef,
  });

  useLayoutEffect(() => {
    if (!mounted) {
      return undefined;
    }

    const dialog = dialogRef.current;
    if (!dialog) {
      return undefined;
    }

    const syncDialogMetrics = () => {
      setDialogMetrics({
        width: dialog.clientWidth,
        height: dialog.clientHeight,
        footerHeight: footerRef.current?.offsetHeight ?? 0,
      });
    };

    syncDialogMetrics();
    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(syncDialogMetrics)
        : null;
    resizeObserver?.observe(dialog);
    if (footerRef.current) {
      resizeObserver?.observe(footerRef.current);
    }
    window.addEventListener("resize", syncDialogMetrics);
    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", syncDialogMetrics);
    };
  }, [mounted]);

  useEffect(() => {
    if (mounted) {
      return;
    }
    setActiveIndex(0);
  }, [mounted]);

  // Активный индекс ведём от Embla: видео и футер целятся в текущий слайд.
  useEffect(() => {
    if (!emblaApi) {
      return undefined;
    }
    const onSelect = () => setActiveIndex(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  // Автоплей крутится только пока модалка реально видима и интерактивна.
  useEffect(() => {
    const autoplay = emblaApi?.plugins()?.autoplay;
    if (!autoplay) {
      return;
    }
    if (isInteractive) {
      autoplay.play();
    } else {
      autoplay.stop();
    }
  }, [emblaApi, isInteractive]);

  useEffect(() => {
    if (!isInteractive) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isInteractive, onClose]);

  const handleOpenProducts = () => {
    if (!activeRaffle?._id) {
      return;
    }
    onClose();
    onOpenProducts(String(activeRaffle._id));
  };

  if (!mounted || slideCount === 0 || typeof document === "undefined") {
    return null;
  }

  const backdropClassName = [
    "home-featured-raffle-modal__backdrop",
    isVisible ? "home-featured-raffle-modal__backdrop--open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const body = !hasCarousel ? (
    <FeaturedRaffleModalCard
      raffle={raffles[0]}
      visualSize={visualSize}
      manage={getManage?.(raffles[0]) ?? null}
      isVideoActive={isInteractive}
    />
  ) : (
    <div className="home-featured-raffle-modal__carousel" ref={emblaRef}>
      <div className="home-featured-raffle-modal__track">
        {raffles.map((raffle, index) => (
          <div
            key={raffle._id}
            className="home-featured-raffle-modal__slide"
            aria-hidden={index !== activeIndex}
          >
            <FeaturedRaffleModalCard
              raffle={raffle}
              visualSize={visualSize}
              slideIndex={index}
              slideCount={slideCount}
              manage={getManage?.(raffle) ?? null}
              isVideoActive={isInteractive && index === activeIndex}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return createPortal(
    <div className={backdropClassName} role="presentation">
      <button
        type="button"
        className="home-featured-raffle-modal__scrim"
        aria-label={RAFFLE_FEATURED_BANNER_UI.CLOSE}
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        className="home-featured-raffle-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-label={RAFFLE_FEATURED_CAROUSEL_UI.SECTION_ARIA}
      >
        <div
          className="home-featured-raffle-modal__scroll"
          style={{ paddingTop: visualInsetPx > 0 ? `${visualInsetPx}px` : undefined }}
        >
          {body}
        </div>

        <div ref={footerRef} className="home-featured-raffle-modal__footer">
          <button
            type="button"
            className="home-featured-raffle-modal__footer-btn"
            onClick={handleOpenProducts}
          >
            {RAFFLE_FEATURED_BANNER_UI.OPEN_PRODUCTS}
          </button>
          <button
            ref={closeButtonRef}
            type="button"
            className="home-featured-raffle-modal__footer-close"
            onClick={onClose}
          >
            {RAFFLE_FEATURED_BANNER_UI.CLOSE}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
