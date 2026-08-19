import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

import { PRODUCT_FLASH_SALE_UI } from "../../../../shared/config/appUiCopy.js";
import { resolveProductDiscountPercent } from "../../lib/computeProductDiscountPercent.js";
import {
  formatFlashSaleCountdown,
  isProductFlashSaleActive,
  resolveFlashSaleCountdownParts,
  resolveProductFlashSaleBorderProgress,
  resolveProductFlashSaleEndsAtMs,
} from "../../lib/isProductFlashSaleActive.js";

import "./ProductDetailsFlashSaleCountdown.css";

const URGENT_SECONDS_LEFT = 300;
const ICON_BORDER_SIZE = 42;
const ICON_BORDER_STROKE = 2.5;
const ICON_BORDER_RADIUS = 10.8;
const ICON_BORDER_INSET = ICON_BORDER_STROKE / 2;
const ICON_BORDER_LENGTH = ICON_BORDER_SIZE - ICON_BORDER_STROKE;

/**
 * @param {{ progress: number }} props
 */
function FlashSaleIconBorder({ progress }) {
  const safeProgress = Math.max(0, Math.min(1, progress));
  const dashOffset = 1 - safeProgress;

  return (
    <svg
      className="product-flash-sale-countdown__icon-border"
      viewBox={`0 0 ${ICON_BORDER_SIZE} ${ICON_BORDER_SIZE}`}
      aria-hidden="true"
      focusable="false"
    >
      <rect
        className="product-flash-sale-countdown__icon-border-progress"
        x={ICON_BORDER_INSET}
        y={ICON_BORDER_INSET}
        width={ICON_BORDER_LENGTH}
        height={ICON_BORDER_LENGTH}
        rx={ICON_BORDER_RADIUS}
        ry={ICON_BORDER_RADIUS}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={dashOffset}
      />
    </svg>
  );
}

/**
 * @param {{
 *   showDays: boolean;
 *   days: string | null;
 *   hours: string;
 *   minutes: string;
 *   seconds: string;
 * }} parts
 */
function FlashSaleCountdownTimer({ parts }) {
  return (
    <div className="product-flash-sale-countdown__timer" aria-hidden="true">
      {parts.showDays ? (
        <>
          <span className="product-flash-sale-countdown__unit">{parts.days}</span>
          <span className="product-flash-sale-countdown__sep">:</span>
        </>
      ) : null}
      <span className="product-flash-sale-countdown__unit">{parts.hours}</span>
      <span className="product-flash-sale-countdown__sep">:</span>
      <span className="product-flash-sale-countdown__unit">{parts.minutes}</span>
      <span className="product-flash-sale-countdown__sep">:</span>
      <span className="product-flash-sale-countdown__unit">{parts.seconds}</span>
    </div>
  );
}

/**
 * @param {{
 *   product: import("../../model/types.js").ProductFromApi;
 *   onExpired?: () => void;
 * }} props
 */
export function ProductDetailsFlashSaleCountdown({ product, onExpired }) {
  const endsAtMs = resolveProductFlashSaleEndsAtMs(product);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [didNotifyExpired, setDidNotifyExpired] = useState(false);

  useEffect(() => {
    if (endsAtMs == null) {
      return undefined;
    }

    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [endsAtMs]);

  useEffect(() => {
    setDidNotifyExpired(false);
  }, [product._id, endsAtMs]);

  useEffect(() => {
    if (endsAtMs == null || didNotifyExpired || endsAtMs > nowMs) {
      return;
    }

    setDidNotifyExpired(true);
    onExpired?.();
  }, [endsAtMs, nowMs, didNotifyExpired, onExpired]);

  if (!isProductFlashSaleActive(product, nowMs) || endsAtMs == null) {
    return null;
  }

  const secondsLeft = Math.max(0, Math.floor((endsAtMs - nowMs) / 1000));
  const discountPercent = resolveProductDiscountPercent(product);
  const countdownParts = resolveFlashSaleCountdownParts(secondsLeft);
  const isUrgent = secondsLeft > 0 && secondsLeft <= URGENT_SECONDS_LEFT;
  const isExpired = secondsLeft <= 0;
  const borderProgress = resolveProductFlashSaleBorderProgress(product, nowMs);
  const countdownText = isExpired
    ? PRODUCT_FLASH_SALE_UI.DETAILS_COUNTDOWN_EXPIRED
    : formatFlashSaleCountdown(secondsLeft);
  const statusLabel = `${PRODUCT_FLASH_SALE_UI.DETAILS_TITLE}. ${PRODUCT_FLASH_SALE_UI.DETAILS_COUNTDOWN_LABEL}: ${countdownText}`;

  return (
    <div
      className={`product-flash-sale-countdown${isUrgent ? " product-flash-sale-countdown--urgent" : ""}`}
      role="status"
      aria-live="polite"
      aria-label={statusLabel}
    >
      <div className="product-flash-sale-countdown__lead">
        <span
          className={[
            "product-flash-sale-countdown__icon",
            borderProgress == null ? "product-flash-sale-countdown__icon--static-border" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-hidden="true"
        >
          {borderProgress != null ? (
            <FlashSaleIconBorder progress={borderProgress} />
          ) : null}
          <Flame size={27} strokeWidth={0} fill="currentColor" />
        </span>

        <div className="product-flash-sale-countdown__info">
          <div className="product-flash-sale-countdown__title-row">
            <span className="product-flash-sale-countdown__title">
              {PRODUCT_FLASH_SALE_UI.DETAILS_TITLE}
            </span>
            {discountPercent != null && discountPercent >= 1 ? (
              <span className="product-flash-sale-countdown__discount">−{discountPercent}%</span>
            ) : null}
          </div>
          <span className="product-flash-sale-countdown__caption" aria-hidden="true">
            {PRODUCT_FLASH_SALE_UI.DETAILS_COUNTDOWN_LABEL}
          </span>
        </div>
      </div>

      {isExpired ? (
        <span className="product-flash-sale-countdown__expired" aria-hidden="true">
          {PRODUCT_FLASH_SALE_UI.DETAILS_COUNTDOWN_EXPIRED}
        </span>
      ) : (
        <FlashSaleCountdownTimer parts={countdownParts} />
      )}
    </div>
  );
}
