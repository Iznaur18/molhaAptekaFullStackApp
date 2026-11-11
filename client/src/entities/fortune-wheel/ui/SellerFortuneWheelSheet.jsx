import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { FORTUNE_WHEEL_SECTION_UI } from "../../../shared/config/appUiCopy.js";
import { getTopModalFocusLayer } from "../../../shared/lib/modalFocusStack.js";
import { useDialogFocusTrap } from "../../../shared/lib/useDialogFocusTrap.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import { useWholesalePriceSheetAnimation } from "../../product/ui/useWholesalePriceSheetAnimation.js";
import { resolveSectorAngles } from "../lib/resolveSectorAngles.js";
import { FortuneWheel } from "./FortuneWheel.jsx";

import "./SellerFortuneWheelSection.css";
import "./SellerFortuneWheelSheet.css";

const TITLE_ID = "seller-fortune-wheel-sheet-title";
/** Длительность вращения — синхрон с CSS transition ротора. */
const SPIN_DURATION_MS = 4200;
const SPIN_TURNS = 5;

/** @param {string | null | undefined} isoDate */
function formatExpiresTime(isoDate) {
  const date = isoDate ? new Date(isoDate) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

/**
 * Целевой угол ротора: стрелка смотрит вверх (0°), поэтому середину
 * выпавшей секции докручиваем до верха плюс несколько полных оборотов.
 * Джиттер в пределах секции — чтобы остановка выглядела живо.
 */
function resolveTargetRotation({ currentRotation, sectorIndex, sectors }) {
  const angles = resolveSectorAngles(sectors);
  const sector = angles[sectorIndex];
  if (!sector) {
    return currentRotation;
  }
  const sectorSpan = sector.endDeg - sector.startDeg;
  const jitterLimit = Math.max(0, sectorSpan / 2 - 8);
  const jitter = (Math.random() * 2 - 1) * jitterLimit;
  const delta = (((-sector.midDeg - currentRotation) % 360) + 360) % 360;
  return currentRotation + SPIN_TURNS * 360 + delta + jitter;
}

/**
 * Bottom sheet с игрой «Колесо фортуны»: выезжает снизу, как модалка
 * объяснения бейджа. Сервер решает исход спина; клиент только анимирует
 * остановку на полученном sectorIndex.
 *
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   sectors: Array<{ discountPercent: number; durationHours: number; enabled: boolean }>;
 *   showLoginTeaser: boolean;
 *   onRequestLogin: () => void;
 *   canSpin: boolean;
 *   todaySpin: object | null;
 *   activeWin: { discountPercent: number; prizeProductId: string | null; prizeProductName: string | null } | null;
 *   onSpin: () => Promise<object | null>;
 *   onSpinSettled: () => void;
 * }} props
 */
export function SellerFortuneWheelSheet({
  isOpen,
  onClose,
  sectors,
  showLoginTeaser,
  onRequestLogin,
  canSpin,
  todaySpin,
  activeWin,
  onSpin,
  onSpinSettled,
}) {
  const panelRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const closeButtonRef = useRef(/** @type {HTMLElement | null} */ (null));
  const settleTimerRef = useRef(
    /** @type {ReturnType<typeof setTimeout> | null} */ (null),
  );
  const { mounted, isVisible } = useWholesalePriceSheetAnimation(isOpen);

  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  /** Результат текущего спина: от сервера получен, ждёт конца анимации. */
  const pendingResultRef = useRef(/** @type {object | null} */ (null));
  /** Раскрытый результат (после остановки колеса). */
  const [revealedResult, setRevealedResult] = useState(
    /** @type {object | null} */ (null),
  );
  const [localError, setLocalError] = useState("");

  useScrollLock(mounted);
  useDialogFocusTrap(panelRef, {
    active: isOpen && isVisible,
    initialFocusRef: closeButtonRef,
    countsAsBlockingOverlay: true,
  });

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key !== "Escape") {
        return;
      }
      const topLayer = getTopModalFocusLayer();
      if (!topLayer || topLayer.container !== panelRef.current) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      onClose();
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [isOpen, onClose]);

  useEffect(
    () => () => {
      if (settleTimerRef.current) {
        clearTimeout(settleTimerRef.current);
      }
    },
    [],
  );

  if (!mounted) {
    return null;
  }

  const sectorsTotal = Array.isArray(sectors) ? sectors.length : 0;

  const settleSpin = () => {
    if (settleTimerRef.current) {
      clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }
    const result = pendingResultRef.current;
    if (!result) {
      setSpinning(false);
      return;
    }
    pendingResultRef.current = null;
    setRevealedResult(result);
    setSpinning(false);
    onSpinSettled();
  };

  const handleSpin = async () => {
    if (!canSpin || spinning) {
      return;
    }
    setSpinning(true);
    setLocalError("");
    setRevealedResult(null);
    try {
      const result = await onSpin();
      if (!result || !Number.isInteger(result.sectorIndex)) {
        throw new Error(FORTUNE_WHEEL_SECTION_UI.SPIN_FALLBACK);
      }
      pendingResultRef.current = result;
      setRotation((current) =>
        resolveTargetRotation({
          currentRotation: current,
          sectorIndex: result.sectorIndex,
          sectors,
        }),
      );
      // Страховка, если transitionend не дошёл (редуцированная анимация и т. п.).
      settleTimerRef.current = setTimeout(settleSpin, SPIN_DURATION_MS + 600);
    } catch (error) {
      pendingResultRef.current = null;
      setSpinning(false);
      setLocalError(
        error instanceof Error ? error.message : FORTUNE_WHEEL_SECTION_UI.SPIN_FALLBACK,
      );
    }
  };

  const playedResult = revealedResult ?? todaySpin ?? null;
  // Призы на колесе (без «пусто») — заполняют зону под колесом до спина.
  const prizeSectors = (Array.isArray(sectors) ? sectors : [])
    .filter((sector) => sector?.enabled !== false)
    .slice()
    .sort((a, b) => b.discountPercent - a.discountPercent);
  const showWinResult = Boolean(playedResult?.result === "win" && playedResult?.prize);
  const showEmptyResult = Boolean(playedResult?.result === "empty");
  const winIsProduct = Boolean(showWinResult && playedResult.prize?.prizeProductId);
  const landedIndex = revealedResult
    ? revealedResult.sectorIndex
    : (todaySpin?.sectorIndex ?? null);
  const playedExpiresAt =
    revealedResult?.prize?.expiresAt ?? todaySpin?.winExpiresAt ?? null;

  return createPortal(
    <div
      className={[
        "fortune-wheel-sheet__backdrop",
        isVisible ? "fortune-wheel-sheet__backdrop--open" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="fortune-wheel-sheet__scrim" aria-hidden="true" />
      <button
        type="button"
        className="fortune-wheel-sheet__dismiss"
        aria-label={FORTUNE_WHEEL_SECTION_UI.CLOSE}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="fortune-wheel-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
      >
        <div className="fortune-wheel-sheet__body">
          <div className="fortune-wheel__head">
            <h2 id={TITLE_ID} className="fortune-wheel__title">
              {FORTUNE_WHEEL_SECTION_UI.TITLE}
            </h2>
            <p className="fortune-wheel__subtitle">
              {FORTUNE_WHEEL_SECTION_UI.SUBTITLE}
            </p>
          </div>

          {showLoginTeaser ? (
            <div className="fortune-wheel__teaser">
              <p className="fortune-wheel__teaser-text">
                {FORTUNE_WHEEL_SECTION_UI.LOGIN_TEASER}
              </p>
              <button
                type="button"
                className="fortune-wheel__login-button"
                onClick={onRequestLogin}
              >
                {FORTUNE_WHEEL_SECTION_UI.LOGIN_BUTTON}
              </button>
            </div>
          ) : (
            <>
              <FortuneWheel
                sectors={sectors}
                rotation={rotation}
                spinning={spinning}
                landedIndex={spinning ? null : landedIndex}
                hubLabel={
                  spinning
                    ? FORTUNE_WHEEL_SECTION_UI.SPINNING
                    : FORTUNE_WHEEL_SECTION_UI.SPIN
                }
                hubDisabled={!canSpin || sectorsTotal === 0 || Boolean(playedResult)}
                onHubClick={handleSpin}
                onSpinEnd={() => {
                  if (spinning && pendingResultRef.current) {
                    settleSpin();
                  }
                }}
              />

              <div className="fortune-wheel__feedback">
                {showWinResult || showEmptyResult ? (
                  <div
                    className={`fortune-wheel__result${showWinResult ? " fortune-wheel__result_win" : ""}`}
                    role="status"
                  >
                    <p className="fortune-wheel__result-title">
                      {showWinResult
                        ? winIsProduct
                          ? FORTUNE_WHEEL_SECTION_UI.WIN_PRODUCT_TITLE(
                              playedResult.prize.prizeProductName ?? "",
                            )
                          : FORTUNE_WHEEL_SECTION_UI.WIN_TITLE(
                              playedResult.prize.discountPercent,
                            )
                        : FORTUNE_WHEEL_SECTION_UI.EMPTY_TITLE}
                    </p>
                    <p className="fortune-wheel__result-text">
                      {showWinResult
                        ? winIsProduct
                          ? FORTUNE_WHEEL_SECTION_UI.WIN_PRODUCT_APPLIES
                          : FORTUNE_WHEEL_SECTION_UI.WIN_APPLIES
                        : FORTUNE_WHEEL_SECTION_UI.EMPTY_HINT}
                    </p>
                    {showWinResult && playedExpiresAt ? (
                      <p className="fortune-wheel__timer">
                        <span aria-hidden="true">⏳</span>
                        {FORTUNE_WHEEL_SECTION_UI.WIN_EXPIRES(
                          formatExpiresTime(playedExpiresAt),
                        )}
                      </p>
                    ) : null}
                  </div>
                ) : localError ? (
                  <p
                    className="fortune-wheel__hint fortune-wheel__hint_error"
                    role="alert"
                  >
                    {localError}
                  </p>
                ) : activeWin && !canSpin ? (
                  <p className="fortune-wheel__hint" role="status">
                    {activeWin.prizeProductId
                      ? FORTUNE_WHEEL_SECTION_UI.ACTIVE_PRODUCT_WIN_NOTICE(
                          activeWin.prizeProductName ?? "",
                        )
                      : FORTUNE_WHEEL_SECTION_UI.ACTIVE_WIN_NOTICE(
                          activeWin.discountPercent,
                        )}
                  </p>
                ) : prizeSectors.length > 0 ? (
                  <div className="fortune-wheel__prizes">
                    <p className="fortune-wheel__prizes-title">
                      {FORTUNE_WHEEL_SECTION_UI.PRIZES_TITLE}
                    </p>
                    <ul className="fortune-wheel__prizes-list">
                      {prizeSectors.map((sector, index) => (
                        <li key={index} className="fortune-wheel__prize-chip">
                          {sector.prizeProductId
                            ? FORTUNE_WHEEL_SECTION_UI.PRIZE_CHIP_PRODUCT
                            : FORTUNE_WHEEL_SECTION_UI.PRIZE_CHIP(
                                sector.discountPercent,
                                sector.durationHours,
                              )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>
        <footer className="fortune-wheel-sheet__footer">
          <button
            ref={closeButtonRef}
            type="button"
            className="fortune-wheel-sheet__close"
            onClick={onClose}
          >
            {FORTUNE_WHEEL_SECTION_UI.CLOSE}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
