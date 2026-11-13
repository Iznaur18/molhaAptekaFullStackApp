import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import ChevronRight from "lucide-react-native/icons/chevron-right";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";

import { SellerStorefrontSheet } from "@/entities/user/ui/SellerStorefrontSheet";
import { FORTUNE_WHEEL_SECTION_UI as UI } from "@/shared/config";
import { useSellerGamesStyles } from "@/shared/theme/sellerGamesStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { GradientFill } from "@/shared/ui/GradientFill";

import type { FortuneWheelSector, FortuneWheelSpin } from "../api/fortuneWheelApi";
import { fortuneWheelQueryKeys } from "../model/fortuneWheelQueryKeys";
import { useSellerFortuneWheelStateQuery } from "../model/useSellerFortuneWheelStateQuery";
import { useSpinFortuneWheelMutation } from "../model/useSpinFortuneWheelMutation";
import { resolveSectorAngles } from "../lib/resolveSectorAngles";
import { FortuneWheelView } from "./FortuneWheelView";

/** Длительность вращения — паритет web SPIN_DURATION_MS (синхрон с CSS). */
const SPIN_DURATION_MS = 4200;
const SPIN_TURNS = 5;

/** Оранжевое колесо на тёмной кнопке — паритет web FortuneWheelToggleIcon. */
function FortuneWheelToggleIcon() {
  return (
    <Svg width={34} height={34} viewBox="0 0 48 48" fill="none">
      <Circle cx={24} cy={24} r={17} stroke="#ff7a1a" strokeWidth={4} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = ((deg - 90) * Math.PI) / 180;
        return (
          <Line
            key={deg}
            x1={24 + 5 * Math.cos(rad)}
            y1={24 + 5 * Math.sin(rad)}
            x2={24 + 15 * Math.cos(rad)}
            y2={24 + 15 * Math.sin(rad)}
            stroke="#ff7a1a"
            strokeWidth={3}
            strokeLinecap="round"
          />
        );
      })}
      <Circle cx={24} cy={24} r={4} fill="#ff7a1a" />
    </Svg>
  );
}

function formatExpiresTime(isoDate?: string | null): string {
  const date = isoDate ? new Date(isoDate) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return "";
  }
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

/**
 * Целевой угол ротора — паритет web resolveTargetRotation: стрелка смотрит
 * вверх, середину выпавшей секции докручиваем до верха + полные обороты.
 */
function resolveTargetRotation(
  currentRotation: number,
  sectorIndex: number,
  sectors: FortuneWheelSector[],
): number {
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

type SellerFortuneWheelGameProps = {
  sellerId: string;
  isAuthorized: boolean;
  isSelf: boolean;
};

/**
 * «Колесо фортуны» на витрине продавца — паритет web
 * `SellerFortuneWheelSection` + `SellerFortuneWheelSheet`. Один спин в день,
 * секцию выбирает сервер, клиент только анимирует остановку.
 */
export const SellerFortuneWheelGame = ({
  sellerId,
  isAuthorized,
  isSelf,
}: SellerFortuneWheelGameProps) => {
  const router = useRouter();
  const styles = useSellerGamesStyles();
  const queryClient = useQueryClient();
  // ВРЕМЕННО для локального теста — паритет web allowSelfPlay.
  const allowSelfPlay = __DEV__;
  const hiddenForSelf = isSelf && !allowSelfPlay;

  const stateQuery = useSellerFortuneWheelStateQuery({
    sellerId,
    enabled: !hiddenForSelf,
  });
  const spinMutation = useSpinFortuneWheelMutation({ sellerId });
  const [sheetOpen, setSheetOpen] = useState(false);

  const rotationRef = useRef(new Animated.Value(0));
  const rotationValueRef = useRef(0);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [spinning, setSpinning] = useState(false);
  /** Результат текущего спина: от сервера получен, ждёт конца анимации. */
  const pendingResultRef = useRef<FortuneWheelSpin | null>(null);
  /** Раскрытый результат (после остановки колеса). */
  const [revealedResult, setRevealedResult] = useState<FortuneWheelSpin | null>(null);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    const rotation = rotationRef.current;
    const id = rotation.addListener(({ value }) => {
      rotationValueRef.current = value;
    });
    return () => {
      rotation.removeListener(id);
      if (settleTimerRef.current) {
        clearTimeout(settleTimerRef.current);
      }
    };
  }, []);

  const state = stateQuery.data;

  const sectors = useMemo(
    () => (Array.isArray(state?.sectors) ? state.sectors : []),
    [state],
  );

  if (hiddenForSelf || !state || state.enabled !== true) {
    return null;
  }

  const canSpin = state.canSpin === true;
  const todaySpin = state.todaySpin ?? null;
  const activeWin = state.activeWin ?? null;
  const showLoginTeaser = state.requiresAuth === true && !isAuthorized;

  const handleSpinSettled = () => {
    queryClient.invalidateQueries({
      queryKey: fortuneWheelQueryKeys.stateBySeller(String(sellerId)),
    });
  };

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
    handleSpinSettled();
  };

  const handleSpin = async () => {
    if (!canSpin || spinning) {
      return;
    }
    setSpinning(true);
    setLocalError("");
    setRevealedResult(null);
    try {
      const result = await spinMutation.mutateAsync();
      if (!result || !Number.isInteger(result.sectorIndex)) {
        throw new Error(UI.SPIN_FALLBACK);
      }
      pendingResultRef.current = result;
      const target = resolveTargetRotation(
        rotationValueRef.current,
        result.sectorIndex,
        sectors,
      );
      Animated.timing(rotationRef.current, {
        toValue: target,
        duration: SPIN_DURATION_MS,
        easing: Easing.bezier(0.12, 0.75, 0.08, 1),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && pendingResultRef.current) {
          settleSpin();
        }
      });
      // Страховка, если колбэк анимации не дошёл.
      settleTimerRef.current = setTimeout(settleSpin, SPIN_DURATION_MS + 600);
    } catch (error) {
      pendingResultRef.current = null;
      setSpinning(false);
      setLocalError(error instanceof Error ? error.message : UI.SPIN_FALLBACK);
    }
  };

  const playedResult = revealedResult ?? todaySpin ?? null;
  const prizeSectors = sectors
    .filter((sector) => sector?.enabled !== false)
    .slice()
    .sort((a, b) => b.discountPercent - a.discountPercent);
  const showWinResult = Boolean(playedResult?.result === "win" && playedResult?.prize);
  const showEmptyResult = Boolean(playedResult?.result === "empty");
  const winIsProduct = Boolean(showWinResult && playedResult?.prize?.prizeProductId);
  const landedIndex = revealedResult
    ? revealedResult.sectorIndex
    : (todaySpin?.sectorIndex ?? null);
  const playedExpiresAt =
    revealedResult?.prize?.expiresAt ?? todaySpin?.winExpiresAt ?? null;

  return (
    <>
      <Pressable
        style={({ pressed }) => [styles.toggle, pressed && styles.togglePressed]}
        onPress={() => setSheetOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={UI.TITLE}
      >
        <GradientFill colors={["#242c3f", "#171d2b"]} style={styles.toggleGradient} />
        <View style={styles.toggleContent}>
          <FortuneWheelToggleIcon />
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
        <Text style={styles.sheetSubtitle}>{UI.SUBTITLE}</Text>

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
            <FortuneWheelView
              sectors={sectors}
              rotation={rotationRef.current}
              spinning={spinning}
              landedIndex={spinning ? null : landedIndex}
              hubLabel={spinning ? UI.SPINNING : UI.SPIN}
              hubDisabled={!canSpin || sectors.length === 0 || Boolean(playedResult)}
              onHubPress={() => void handleSpin()}
            />

            <View style={styles.feedback}>
              {showWinResult || showEmptyResult ? (
                <View style={[styles.result, showWinResult && styles.resultWin]}>
                  <Text style={styles.resultTitle}>
                    {showWinResult
                      ? winIsProduct
                        ? UI.WIN_PRODUCT_TITLE(playedResult?.prize?.prizeProductName ?? "")
                        : UI.WIN_TITLE(playedResult?.prize?.discountPercent ?? 0)
                      : UI.EMPTY_TITLE}
                  </Text>
                  <Text style={styles.resultText}>
                    {showWinResult
                      ? winIsProduct
                        ? UI.WIN_PRODUCT_APPLIES
                        : UI.WIN_APPLIES
                      : UI.EMPTY_HINT}
                  </Text>
                  {showWinResult && playedExpiresAt ? (
                    <View style={styles.timerPill}>
                      <Text style={styles.timerPillText}>
                        ⏳ {UI.WIN_EXPIRES(formatExpiresTime(playedExpiresAt))}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : localError ? (
                <Text
                  style={[styles.hint, styles.hintError]}
                  accessibilityRole="alert"
                >
                  {localError}
                </Text>
              ) : activeWin && !canSpin ? (
                <Text style={styles.hint}>
                  {activeWin.prizeProductId
                    ? UI.ACTIVE_PRODUCT_WIN_NOTICE(activeWin.prizeProductName ?? "")
                    : UI.ACTIVE_WIN_NOTICE(activeWin.discountPercent ?? 0)}
                </Text>
              ) : prizeSectors.length > 0 ? (
                <>
                  <Text style={styles.prizesTitle}>{UI.PRIZES_TITLE}</Text>
                  <View style={styles.prizesList}>
                    {prizeSectors.map((sector, index) => (
                      <View key={index} style={styles.prizeChip}>
                        <Text style={styles.prizeChipText}>
                          {sector.prizeProductId
                            ? UI.PRIZE_CHIP_PRODUCT
                            : UI.PRIZE_CHIP(sector.discountPercent, sector.durationHours)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : null}
            </View>
          </>
        )}
      </SellerStorefrontSheet>
    </>
  );
};
