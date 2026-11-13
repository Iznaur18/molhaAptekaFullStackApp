import { LUCKY_BOX_BOXES_TOTAL } from "@molha/api-contract";
import { useRouter } from "expo-router";
import ChevronRight from "lucide-react-native/icons/chevron-right";
import Gift from "lucide-react-native/icons/gift";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { SellerStorefrontSheet } from "@/entities/user/ui/SellerStorefrontSheet";
import { LUCKY_BOX_SECTION_UI as UI } from "@/shared/config";
import { useSellerGamesStyles } from "@/shared/theme/sellerGamesStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { GradientFill } from "@/shared/ui/GradientFill";

import type { LuckyBoxPlay } from "../api/luckyBoxApi";
import { usePlayLuckyBoxMutation } from "../model/usePlayLuckyBoxMutation";
import { useSellerLuckyBoxStateQuery } from "../model/useSellerLuckyBoxStateQuery";

type BoxState = "closed" | "picked-win" | "picked-empty" | "revealed-prize" | "dimmed";

/** web `formatExpiresTime`: локальное «HH:MM» (без Intl — Hermes-safe). */
function formatExpiresTime(isoDate?: string | null): string {
  const date = isoDate ? new Date(isoDate) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return "";
  }
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

type SellerLuckyBoxGameProps = {
  sellerId: string;
  isAuthorized: boolean;
  isSelf: boolean;
};

/**
 * «Коробки удачи» на витрине продавца — паритет web `SellerLuckyBoxSection` +
 * `SellerLuckyBoxSheet`: на витрине кнопка-карточка, игра открывается шторкой.
 * 6 коробок, до двух попыток в день (вторая — если первая пустая).
 */
export const SellerLuckyBoxGame = ({
  sellerId,
  isAuthorized,
  isSelf,
}: SellerLuckyBoxGameProps) => {
  const router = useRouter();
  const styles = useSellerGamesStyles();
  // ВРЕМЕННО для локального теста: в dev-сборке продавец может играть на
  // своей витрине. Паритет web `allowSelfPlay` (import.meta.env.DEV).
  const allowSelfPlay = __DEV__;
  const hiddenForSelf = isSelf && !allowSelfPlay;

  const stateQuery = useSellerLuckyBoxStateQuery({
    sellerId,
    enabled: !hiddenForSelf,
  });
  const playMutation = usePlayLuckyBoxMutation({ sellerId });
  /** Сыгранные в этой сессии попытки до refetch state (мгновенный отклик). */
  const [localPlays, setLocalPlays] = useState<LuckyBoxPlay[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);

  const state = stateQuery.data;
  const plays = useMemo(() => {
    const serverPlays = Array.isArray(state?.todayPlays) ? state.todayPlays : [];
    const knownBoxes = new Set(serverPlays.map((play) => play.pickedBoxIndex));
    const pending = localPlays.filter((play) => !knownBoxes.has(play.pickedBoxIndex));
    return [...serverPlays, ...pending];
  }, [state, localPlays]);

  const boxStates = useMemo<BoxState[]>(() => {
    const states = Array.from({ length: LUCKY_BOX_BOXES_TOTAL }, () => "closed" as BoxState);
    if (plays.length === 0) {
      return states;
    }
    const layout = plays.map((play) => play.layout).find(Boolean) ?? [];
    const pickedByIndex = new Map(plays.map((play) => [play.pickedBoxIndex, play.result]));
    for (let index = 0; index < LUCKY_BOX_BOXES_TOTAL; index += 1) {
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
    const map = new Map<
      number,
      { discountPercent?: number | null; prizeProductId?: string | null }
    >();
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
            return UI.BOX_PRODUCT_FACE;
          }
          const percent = prize?.discountPercent;
          return percent ? `${percent}%` : "%";
        }
        if (boxState === "picked-empty") {
          return UI.BOX_EMPTY_FACE;
        }
        return "";
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
  const attemptsUsed = attemptsTotal - attemptsLeft;
  // Счётчик попыток важнее флага сервера: в self-режиме (приёмка) сервер
  // всегда отвечает canPlay:true, но локально сыгранные попытки считаем.
  const canPlay = state.canPlay === true && !wonToday && attemptsLeft > 0;
  const showLoginTeaser = state.requiresAuth === true && !isAuthorized;
  const activeWin = state.activeWin ?? null;

  const handlePick = (boxIndex: number) => {
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

  const errorMessage = playMutation.isError
    ? (playMutation.error?.message ?? UI.PLAY_FALLBACK)
    : null;

  const showWinResult = Boolean(lastPlay?.result === "win" && lastPlay.prize);
  const winIsProduct = Boolean(showWinResult && lastPlay?.prize?.prizeProductId);
  const showEmptyResult = Boolean(lastPlay?.result === "empty" && attemptsLeft <= 0);
  const showResult = showWinResult || showEmptyResult;
  const winExpiresAt =
    (showWinResult && (lastPlay?.winExpiresAt ?? lastPlay?.prize?.expiresAt)) || null;

  const hintText = playMutation.isPending
    ? UI.OPENING
    : errorMessage
      ? errorMessage
      : lastPlay?.result === "empty" && attemptsLeft > 0
        ? UI.SECOND_ATTEMPT_HINT
        : plays.length === 0 && canPlay
          ? UI.ATTEMPT_HINT
          : plays.length === 0 && !canPlay && activeWin
            ? activeWin.prizeProductId
              ? UI.ACTIVE_PRODUCT_WIN_NOTICE(activeWin.prizeProductName ?? "")
              : UI.ACTIVE_WIN_NOTICE(activeWin.discountPercent ?? 0)
            : null;

  return (
    <>
      <Pressable
        style={({ pressed }) => [styles.toggle, pressed && styles.togglePressed]}
        onPress={() => setSheetOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={UI.TITLE}
      >
        <GradientFill colors={["#6d5bf6", "#8b5cf6"]} style={styles.toggleGradient} />
        <View style={styles.toggleContent}>
          <Gift size={34} color="#ffffff" strokeWidth={1.8} />
          <View style={styles.toggleHead}>
            <Text style={styles.toggleTitle}>{UI.TITLE}</Text>
            <Text style={styles.toggleSubtitle}>{UI.BUTTON_HINT}</Text>
          </View>
          <ChevronRight size={20} color="rgba(255, 255, 255, 0.85)" />
        </View>
      </Pressable>

      <SellerStorefrontSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={UI.TITLE}
        closeLabel={UI.CLOSE}
      >
        <Text style={styles.sheetSubtitle}>{UI.SUBTITLE(state.prizesTotal ?? 0)}</Text>

        {showLoginTeaser ? (
          <View style={styles.teaser}>
            <Text style={styles.teaserText}>{UI.LOGIN_TEASER}</Text>
            <AppButton
              label={UI.LOGIN_BUTTON}
              variant="primary"
              onPress={() => {
                setSheetOpen(false);
                router.push("/(auth)/login");
              }}
            />
          </View>
        ) : (
          <>
            <View
              style={styles.boxesGrid}
              accessibilityState={{ busy: playMutation.isPending }}
            >
              {boxStates.map((boxState, index) => {
                const disabled =
                  !canPlay ||
                  playMutation.isPending ||
                  boxState === "picked-win" ||
                  boxState === "picked-empty";
                const face = boxFaces[index];
                const isPrizeFace =
                  boxState === "picked-win" || boxState === "revealed-prize";
                const isProductFace = face === UI.BOX_PRODUCT_FACE;
                return (
                  <Pressable
                    key={index}
                    style={({ pressed }) => [
                      styles.box,
                      boxState === "picked-win" && styles.boxPickedWin,
                      boxState === "picked-empty" && styles.boxPickedEmpty,
                      boxState === "revealed-prize" && styles.boxRevealedPrize,
                      boxState === "dimmed" && styles.boxDimmed,
                      pressed && !disabled && styles.togglePressed,
                    ]}
                    disabled={disabled}
                    onPress={() => handlePick(index)}
                    accessibilityRole="button"
                    accessibilityLabel={UI.BOX_ARIA(index)}
                  >
                    {boxState === "closed" || boxState === "dimmed" ? (
                      <Gift size={34} color="#ff7a1a" strokeWidth={1.6} />
                    ) : (
                      <View style={styles.boxFace}>
                        {isPrizeFace && !isProductFace && boxState === "picked-win" ? (
                          <Text style={styles.boxFaceLabel}>{UI.BOX_PRIZE_LABEL}</Text>
                        ) : null}
                        <Text
                          style={[
                            styles.boxFaceValue,
                            boxState === "picked-win" && styles.boxFaceValueWin,
                            boxState === "picked-empty" && styles.boxFaceValueEmpty,
                          ]}
                        >
                          {face}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.feedback}>
              {showResult ? (
                <View style={[styles.result, showWinResult && styles.resultWin]}>
                  <Text style={styles.resultTitle}>
                    {showWinResult
                      ? winIsProduct
                        ? UI.WIN_PRODUCT_TITLE(lastPlay?.prize?.prizeProductName ?? "")
                        : UI.WIN_TITLE(lastPlay?.prize?.discountPercent ?? 0)
                      : UI.EMPTY_TITLE}
                  </Text>
                  <Text style={styles.resultText}>
                    {showWinResult
                      ? winIsProduct
                        ? UI.WIN_PRODUCT_APPLIES
                        : winExpiresAt
                          ? UI.WIN_APPLIES
                          : UI.ACTIVE_WIN_NOTICE(lastPlay?.prize?.discountPercent ?? 0)
                      : UI.EMPTY_HINT}
                  </Text>
                  {showWinResult && winExpiresAt ? (
                    <View style={styles.timerPill}>
                      <Text style={styles.timerPillText}>
                        ⏳ {UI.WIN_EXPIRES(formatExpiresTime(winExpiresAt))}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : (
                <>
                  <View
                    style={styles.attempts}
                    accessibilityLabel={UI.ATTEMPTS_ARIA(attemptsLeft, attemptsTotal)}
                  >
                    {Array.from({ length: attemptsTotal }, (_, index) => (
                      <Gift
                        key={index}
                        size={26}
                        color="#ff7a1a"
                        strokeWidth={1.8}
                        style={index < attemptsUsed ? { opacity: 0.25 } : undefined}
                      />
                    ))}
                  </View>
                  {hintText ? (
                    <Text
                      style={[styles.hint, errorMessage && styles.hintError]}
                      accessibilityRole={errorMessage ? "alert" : "text"}
                    >
                      {hintText}
                    </Text>
                  ) : null}
                </>
              )}
            </View>
          </>
        )}
      </SellerStorefrontSheet>
    </>
  );
};
