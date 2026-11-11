import { useMemo, useState } from "react";
import { Gift } from "lucide-react";

import { LUCKY_BOX_SECTION_UI } from "../../../shared/config/appUiCopy.js";
import { useSellerLuckyBoxStateQuery } from "../model/useSellerLuckyBoxStateQuery.js";
import { usePlayLuckyBoxMutation } from "../model/usePlayLuckyBoxMutation.js";
import { SellerLuckyBoxSheet } from "./SellerLuckyBoxSheet.jsx";

import "./SellerLuckyBoxSection.css";

const BOXES_TOTAL = 6;

/**
 * «Коробки удачи» на витрине продавца: кнопка-карточка, по клику игра
 * открывается bottom sheet'ом. 6 коробок, часть призовых, до двух попыток
 * в день (вторая — если первая пустая). Раскладку отдаёт сервер только
 * после совершённой попытки.
 *
 * @param {{
 *   sellerId: string;
 *   isAuthorized: boolean;
 *   isSelf: boolean;
 *   onRequestLogin: () => void;
 * }} props
 */
export function SellerLuckyBoxSection({
  sellerId,
  isAuthorized,
  isSelf,
  onRequestLogin,
}) {
  // ВРЕМЕННО для локального теста: в dev-сборке продавец может играть на
  // своей витрине. В prod (import.meta.env.DEV === false) — блок скрыт.
  // TODO: убрать allowSelfPlay после приёмки фичи.
  const allowSelfPlay = import.meta.env.DEV === true;
  const hiddenForSelf = isSelf && !allowSelfPlay;
  const stateQuery = useSellerLuckyBoxStateQuery({
    sellerId,
    enabled: !hiddenForSelf,
  });
  const playMutation = usePlayLuckyBoxMutation({ sellerId });
  /** Сыгранные в этой сессии попытки до refetch state (мгновенный отклик). */
  const [localPlays, setLocalPlays] = useState([]);
  /** Bottom sheet с игрой: на витрине видна только кнопка. */
  const [sheetOpen, setSheetOpen] = useState(false);

  const state = stateQuery.data;
  const plays = useMemo(() => {
    const serverPlays = Array.isArray(state?.todayPlays) ? state.todayPlays : [];
    const knownBoxes = new Set(serverPlays.map((play) => play.pickedBoxIndex));
    const pending = localPlays.filter((play) => !knownBoxes.has(play.pickedBoxIndex));
    return [...serverPlays, ...pending];
  }, [state, localPlays]);

  const boxStates = useMemo(() => {
    const states = Array.from({ length: BOXES_TOTAL }, () => "closed");
    if (plays.length === 0) {
      return states;
    }
    // Раскладку сервер раскрывает только по завершении попыток: до этого
    // нетронутые коробки остаются закрытыми.
    const layout = plays.map((play) => play.layout).find(Boolean) ?? [];
    const pickedByIndex = new Map(
      plays.map((play) => [play.pickedBoxIndex, play.result]),
    );
    for (let index = 0; index < BOXES_TOTAL; index += 1) {
      const pickedResult = pickedByIndex.get(index);
      if (pickedResult) {
        states[index] = pickedResult === "win" ? "picked-win" : "picked-empty";
      } else if (layout.includes(index)) {
        states[index] = "revealed-prize";
      } else if (layout.length > 0) {
        states[index] = "dimmed";
      }
    }
    return states;
  }, [plays]);

  /** Приз каждой раскрытой коробки: скидка (%) или товар-приз. */
  const prizeByBox = useMemo(() => {
    const map = new Map();
    for (const play of plays) {
      if (Array.isArray(play.layoutPrizes)) {
        for (const entry of play.layoutPrizes) {
          map.set(entry.boxIndex, entry);
        }
      }
      if (play.result === "win" && play.prize) {
        map.set(play.pickedBoxIndex, play.prize);
      }
    }
    return map;
  }, [plays]);

  const boxFaces = useMemo(
    () =>
      boxStates.map((boxState, index) => {
        if (boxState === "picked-win" || boxState === "revealed-prize") {
          const prize = prizeByBox.get(index);
          if (prize?.prizeProductId) {
            return LUCKY_BOX_SECTION_UI.BOX_PRODUCT_FACE;
          }
          const percent = prize?.discountPercent;
          return percent ? `${percent}%` : "%";
        }
        if (boxState === "picked-empty") {
          return LUCKY_BOX_SECTION_UI.BOX_EMPTY_FACE;
        }
        return "?";
      }),
    [boxStates, prizeByBox],
  );

  if (hiddenForSelf || !state?.enabled) {
    return null;
  }

  const attemptsTotal = state.attemptsTotal ?? 2;
  const lastPlay = plays.at(-1) ?? null;
  const wonToday = plays.some((play) => play.result === "win");
  const attemptsLeft = attemptsTotal - plays.length;
  // Счётчик попыток важнее флага сервера: в self-режиме (приёмка) сервер
  // всегда отвечает canPlay:true, но локально сыгранные попытки считаем.
  const canPlay = state.canPlay === true && !wonToday && attemptsLeft > 0;
  const showLoginTeaser = state.requiresAuth === true && !isAuthorized;

  const handlePick = (boxIndex) => {
    if (!canPlay || playMutation.isPending) {
      return;
    }
    playMutation.mutate(boxIndex, {
      onSuccess: (result) => {
        if (result) {
          setLocalPlays((previous) => [...previous, result]);
        }
      },
    });
  };

  return (
    <>
      <section className="lucky-box" aria-label={LUCKY_BOX_SECTION_UI.TITLE}>
        <button
          type="button"
          className="lucky-box__toggle"
          onClick={() => setSheetOpen(true)}
        >
          <Gift className="lucky-box__toggle-svg" aria-hidden="true" />
          <span className="lucky-box__head">
            <span className="lucky-box__title">{LUCKY_BOX_SECTION_UI.TITLE}</span>
            <span className="lucky-box__subtitle">
              {LUCKY_BOX_SECTION_UI.BUTTON_HINT}
            </span>
          </span>
          <span className="lucky-box__toggle-icon" aria-hidden="true">
            ›
          </span>
        </button>
      </section>

      <SellerLuckyBoxSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        prizesTotal={state.prizesTotal}
        showLoginTeaser={showLoginTeaser}
        onRequestLogin={onRequestLogin}
        boxStates={boxStates}
        boxFaces={boxFaces}
        canPlay={canPlay}
        isPending={playMutation.isPending}
        errorMessage={
          playMutation.isError
            ? (playMutation.error?.message ?? LUCKY_BOX_SECTION_UI.PLAY_FALLBACK)
            : null
        }
        onPick={handlePick}
        lastPlay={lastPlay}
        attemptsTotal={attemptsTotal}
        attemptsLeft={attemptsLeft}
        hasPlays={plays.length > 0}
        activeWin={state.activeWin ?? null}
      />
    </>
  );
}
