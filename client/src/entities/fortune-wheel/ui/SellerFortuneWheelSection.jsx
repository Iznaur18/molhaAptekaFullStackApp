import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { FORTUNE_WHEEL_SECTION_UI } from "../../../shared/config/appUiCopy.js";
import { fortuneWheelQueryKeys } from "../model/fortuneWheelQueryKeys.js";
import { useSellerFortuneWheelStateQuery } from "../model/useSellerFortuneWheelStateQuery.js";
import { useSpinFortuneWheelMutation } from "../model/useSpinFortuneWheelMutation.js";
import { SellerFortuneWheelSheet } from "./SellerFortuneWheelSheet.jsx";

import "./SellerFortuneWheelSection.css";

/** Оранжевое колесо на тёмной кнопке — как в дизайн-референсе. */
function FortuneWheelToggleIcon() {
  return (
    <svg
      className="fortune-wheel__toggle-svg"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="17" stroke="currentColor" strokeWidth="4" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = ((deg - 90) * Math.PI) / 180;
        return (
          <line
            key={deg}
            x1={24 + 5 * Math.cos(rad)}
            y1={24 + 5 * Math.sin(rad)}
            x2={24 + 15 * Math.cos(rad)}
            y2={24 + 15 * Math.sin(rad)}
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        );
      })}
      <circle cx="24" cy="24" r="4" fill="currentColor" />
    </svg>
  );
}

/**
 * «Колесо фортуны» на витрине продавца: кнопка-карточка рядом с «Коробками
 * удачи», по клику игра открывается bottom sheet'ом. Один спин в день,
 * секцию выбирает сервер взвешенным рандомом.
 *
 * @param {{
 *   sellerId: string;
 *   isAuthorized: boolean;
 *   isSelf: boolean;
 *   onRequestLogin: () => void;
 * }} props
 */
export function SellerFortuneWheelSection({
  sellerId,
  isAuthorized,
  isSelf,
  onRequestLogin,
}) {
  // ВРЕМЕННО для локального теста: в dev-сборке продавец может крутить
  // колесо на своей витрине. В prod (import.meta.env.DEV === false) — блок
  // скрыт. TODO: убрать allowSelfPlay после приёмки фичи.
  const allowSelfPlay = import.meta.env.DEV === true;
  const hiddenForSelf = isSelf && !allowSelfPlay;
  const stateQuery = useSellerFortuneWheelStateQuery({
    sellerId,
    enabled: !hiddenForSelf,
  });
  const spinMutation = useSpinFortuneWheelMutation({ sellerId });
  const queryClient = useQueryClient();
  /** Bottom sheet с игрой: на витрине видна только кнопка. */
  const [sheetOpen, setSheetOpen] = useState(false);

  const state = stateQuery.data;

  if (hiddenForSelf) {
    return null;
  }
  if (!state || state.enabled !== true) {
    return null;
  }

  const showLoginTeaser = state.requiresAuth === true && !isAuthorized;

  const handleSpin = () => spinMutation.mutateAsync();

  const handleSpinSettled = () => {
    queryClient.invalidateQueries({
      queryKey: fortuneWheelQueryKeys.stateBySeller(String(sellerId)),
    });
  };

  return (
    <>
      <section className="fortune-wheel" aria-label={FORTUNE_WHEEL_SECTION_UI.TITLE}>
        <button
          type="button"
          className="fortune-wheel__toggle"
          onClick={() => setSheetOpen(true)}
        >
          <FortuneWheelToggleIcon />
          <span className="fortune-wheel__head">
            <span className="fortune-wheel__title">
              {FORTUNE_WHEEL_SECTION_UI.TITLE}
            </span>
            <span className="fortune-wheel__subtitle">
              {FORTUNE_WHEEL_SECTION_UI.BUTTON_HINT}
            </span>
          </span>
          <span className="fortune-wheel__toggle-icon" aria-hidden="true">
            ›
          </span>
        </button>
      </section>

      <SellerFortuneWheelSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        sectors={state.sectors ?? []}
        showLoginTeaser={showLoginTeaser}
        onRequestLogin={onRequestLogin}
        canSpin={state.canSpin === true}
        todaySpin={state.todaySpin ?? null}
        activeWin={state.activeWin ?? null}
        onSpin={handleSpin}
        onSpinSettled={handleSpinSettled}
      />
    </>
  );
}
