import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { LUCKY_BOX_SECTION_UI } from "../../../shared/config/appUiCopy.js";
import { getTopModalFocusLayer } from "../../../shared/lib/modalFocusStack.js";
import { useDialogFocusTrap } from "../../../shared/lib/useDialogFocusTrap.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import { useWholesalePriceSheetAnimation } from "../../product/ui/useWholesalePriceSheetAnimation.js";

import "./SellerLuckyBoxSection.css";
import "./SellerLuckyBoxSheet.css";

const TITLE_ID = "seller-lucky-box-sheet-title";

/** @param {string | null | undefined} isoDate */
function formatExpiresTime(isoDate) {
  const date = isoDate ? new Date(isoDate) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

/** Подарочная коробка на закрытых ячейках — вместо «?». */
function LuckyBoxGiftIcon({ className = "lucky-box__gift" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      {/* Крышка и корпус — в цвете лица коробки (фирменный оранжевый). */}
      <rect x="5" y="13" width="38" height="9" rx="3" fill="currentColor" />
      <rect
        x="8.5"
        y="22"
        width="31"
        height="17"
        rx="3"
        fill="currentColor"
        opacity="0.85"
      />
      {/* Лента — в цвет фона ячейки: смотрится как прорезь. */}
      <rect x="21" y="13" width="6" height="26" fill="var(--iz-color-action-soft)" />
      {/* Бант. */}
      <path d="M24 12c-1.8-4.4-9-4.8-9-1 0 2.6 5 3.4 9 1Z" fill="currentColor" />
      <path d="M24 12c1.8-4.4 9-4.8 9-1 0 2.6-5 3.4-9 1Z" fill="currentColor" />
      <circle cx="24" cy="11" r="2" fill="currentColor" />
    </svg>
  );
}

/**
 * Bottom sheet с игрой «Коробки удачи»: выезжает снизу, как модалка
 * объяснения бейджа. Вся игровая логика остаётся в SellerLuckyBoxSection,
 * сюда приходят готовые данные.
 *
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   prizesTotal: number | undefined;
 *   showLoginTeaser: boolean;
 *   onRequestLogin: () => void;
 *   boxStates: string[];
 *   boxFaces: string[];
 *   canPlay: boolean;
 *   isPending: boolean;
 *   errorMessage: string | null;
 *   onPick: (boxIndex: number) => void;
 *   lastPlay: object | null;
 *   attemptsTotal: number;
 *   attemptsLeft: number;
 *   hasPlays: boolean;
 *   activeWin: { discountPercent: number; prizeProductId: string | null; prizeProductName: string | null } | null;
 * }} props
 */
export function SellerLuckyBoxSheet({
  isOpen,
  onClose,
  prizesTotal,
  showLoginTeaser,
  onRequestLogin,
  boxStates,
  boxFaces,
  canPlay,
  isPending,
  errorMessage,
  onPick,
  lastPlay,
  attemptsTotal,
  attemptsLeft,
  hasPlays,
  activeWin,
}) {
  const panelRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const closeButtonRef = useRef(/** @type {HTMLElement | null} */ (null));
  const { mounted, isVisible } = useWholesalePriceSheetAnimation(isOpen);

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

  if (!mounted) {
    return null;
  }

  const showWinResult = Boolean(lastPlay?.result === "win" && lastPlay.prize);
  const winIsProduct = Boolean(showWinResult && lastPlay.prize?.prizeProductId);
  const showEmptyResult = Boolean(lastPlay?.result === "empty" && attemptsLeft <= 0);
  const showResult = showWinResult || showEmptyResult;
  const attemptsUsed = attemptsTotal - attemptsLeft;
  const hintText = isPending
    ? LUCKY_BOX_SECTION_UI.OPENING
    : errorMessage
      ? errorMessage
      : lastPlay?.result === "empty" && attemptsLeft > 0
        ? LUCKY_BOX_SECTION_UI.SECOND_ATTEMPT_HINT
        : !hasPlays && canPlay
          ? LUCKY_BOX_SECTION_UI.ATTEMPT_HINT
          : !hasPlays && !canPlay && activeWin
            ? activeWin.prizeProductId
              ? LUCKY_BOX_SECTION_UI.ACTIVE_PRODUCT_WIN_NOTICE(
                  activeWin.prizeProductName ?? "",
                )
              : LUCKY_BOX_SECTION_UI.ACTIVE_WIN_NOTICE(activeWin.discountPercent)
            : null;

  return createPortal(
    <div
      className={[
        "lucky-box-sheet__backdrop",
        isVisible ? "lucky-box-sheet__backdrop--open" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="lucky-box-sheet__scrim" aria-hidden="true" />
      <button
        type="button"
        className="lucky-box-sheet__dismiss"
        aria-label={LUCKY_BOX_SECTION_UI.CLOSE}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="lucky-box-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
      >
        <div className="lucky-box-sheet__body">
          <div className="lucky-box__head">
            <h2 id={TITLE_ID} className="lucky-box__title">
              {LUCKY_BOX_SECTION_UI.TITLE}
            </h2>
            <p className="lucky-box__subtitle">
              {LUCKY_BOX_SECTION_UI.SUBTITLE(prizesTotal)}
            </p>
          </div>

          {showLoginTeaser ? (
            <div className="lucky-box__teaser">
              <p className="lucky-box__teaser-text">
                {LUCKY_BOX_SECTION_UI.LOGIN_TEASER}
              </p>
              <button
                type="button"
                className="lucky-box__login-button"
                onClick={onRequestLogin}
              >
                {LUCKY_BOX_SECTION_UI.LOGIN_BUTTON}
              </button>
            </div>
          ) : (
            <>
              <div
                className="lucky-box__grid"
                role={canPlay ? "group" : undefined}
                aria-busy={isPending}
              >
                {boxStates.map((boxState, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`lucky-box__box lucky-box__box_${boxState}`}
                    aria-label={LUCKY_BOX_SECTION_UI.BOX_ARIA(index)}
                    disabled={
                      !canPlay ||
                      isPending ||
                      boxState === "picked-win" ||
                      boxState === "picked-empty"
                    }
                    onClick={() => onPick(index)}
                  >
                    <span className="lucky-box__box-face" aria-hidden="true">
                      {boxState === "closed" ? (
                        <LuckyBoxGiftIcon />
                      ) : boxState === "picked-win" || boxState === "revealed-prize" ? (
                        <>
                          {boxFaces[index] !== LUCKY_BOX_SECTION_UI.BOX_PRODUCT_FACE ? (
                            <span className="lucky-box__box-face-label">
                              {LUCKY_BOX_SECTION_UI.BOX_PRIZE_LABEL}
                            </span>
                          ) : null}
                          <span className="lucky-box__box-face-value">
                            {boxFaces[index]}
                          </span>
                        </>
                      ) : (
                        boxFaces[index]
                      )}
                    </span>
                  </button>
                ))}
              </div>

              {/* Зона фиксированной высоты: подсказки и результат меняются
                  без скачков сетки и панели. До результата её заполняет
                  индикатор попыток. */}
              <div className="lucky-box__feedback">
                {showResult ? (
                  <div
                    className={`lucky-box__result${showWinResult ? " lucky-box__result_win" : ""}`}
                    role="status"
                  >
                    <p className="lucky-box__result-title">
                      {showWinResult
                        ? winIsProduct
                          ? LUCKY_BOX_SECTION_UI.WIN_PRODUCT_TITLE(
                              lastPlay.prize.prizeProductName ?? "",
                            )
                          : LUCKY_BOX_SECTION_UI.WIN_TITLE(
                              lastPlay.prize.discountPercent,
                            )
                        : LUCKY_BOX_SECTION_UI.EMPTY_TITLE}
                    </p>
                    <p className="lucky-box__result-text">
                      {showWinResult
                        ? winIsProduct
                          ? LUCKY_BOX_SECTION_UI.WIN_PRODUCT_APPLIES
                          : lastPlay.winExpiresAt || lastPlay.prize?.expiresAt
                            ? LUCKY_BOX_SECTION_UI.WIN_APPLIES
                            : LUCKY_BOX_SECTION_UI.ACTIVE_WIN_NOTICE(
                                lastPlay.prize.discountPercent,
                              )
                        : LUCKY_BOX_SECTION_UI.EMPTY_HINT}
                    </p>
                    {showWinResult &&
                    (lastPlay.winExpiresAt || lastPlay.prize?.expiresAt) ? (
                      <p className="lucky-box__timer">
                        <span aria-hidden="true">⏳</span>
                        {LUCKY_BOX_SECTION_UI.WIN_EXPIRES(
                          formatExpiresTime(
                            lastPlay.winExpiresAt ?? lastPlay.prize?.expiresAt,
                          ),
                        )}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <>
                    <div
                      className="lucky-box__attempts"
                      aria-label={LUCKY_BOX_SECTION_UI.ATTEMPTS_ARIA(
                        attemptsLeft,
                        attemptsTotal,
                      )}
                    >
                      {Array.from({ length: attemptsTotal }, (_, index) => (
                        <LuckyBoxGiftIcon
                          key={index}
                          className={`lucky-box__attempt${index < attemptsUsed ? " lucky-box__attempt_used" : ""}`}
                        />
                      ))}
                    </div>
                    {hintText ? (
                      <p
                        className={`lucky-box__hint${errorMessage && !isPending ? " lucky-box__hint_error" : ""}`}
                        role={errorMessage && !isPending ? "alert" : "status"}
                      >
                        {hintText}
                      </p>
                    ) : null}
                  </>
                )}
              </div>
            </>
          )}
        </div>
        <footer className="lucky-box-sheet__footer">
          <button
            ref={closeButtonRef}
            type="button"
            className="lucky-box-sheet__close"
            onClick={onClose}
          >
            {LUCKY_BOX_SECTION_UI.CLOSE}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
