import { useCallback, useMemo } from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";

import { PROMO_RETURN_STREAK_DOCK_LAYOUT as L } from "@/entities/promo-return-streak/lib/promoReturnStreakDockLayout";
import {
  PROMO_RETURN_STREAK_DISCOUNT_PERCENT_BY_DAY,
  PROMO_RETURN_STREAK_MAX_DAY,
} from "@/entities/promo-return-streak/lib/promoReturnStreakPricing";
import {
  useClaimPromoReturnStreakMutation,
  useMyPromoReturnStreakQuery,
} from "@/entities/promo-return-streak/model/usePromoReturnStreak";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { PROMO_RETURN_STREAK_DOCK_UI } from "@/shared/config";
import { resolveContentMaxWidth } from "@/shared/lib/screenBreakpoints";
import {
  resolveMobileBottomNavHorizontalInset,
  resolveMobileBottomNavLayoutHeight,
} from "@/shared/lib/mobileBottomNavLayout";
import { homeCatalogTabBarRevealProgress } from "@/shared/model/homeCatalogTabBarVisibility";
import { usePromoReturnStreakDockStyles } from "@/shared/theme/promoReturnStreakDockStyles";

const StreakDiscountIcon = () => (
  <Svg width={L.iconSvg} height={L.iconSvg} viewBox="0 0 32 32" fill="none">
    <Path
      d="M4.2 14.8 14.8 4.2A2.8 2.8 0 0 1 16.8 3.4H26.6A2 2 0 0 1 28.6 5.4V15.2a2.8 2.8 0 0 1-.8 2L17.2 27.8a2.8 2.8 0 0 1-4 0L4.2 18.8a2.8 2.8 0 0 1 0-4Z"
      fill={L.flame}
    />
    <Circle cx="22.2" cy="9.8" r="1.85" fill={L.bg} />
    <Path
      d="M11.4 19.8 19.2 12M12.5 12.4a1.4 1.4 0 1 1-2.8 0 1.4 1.4 0 0 1 2.8 0ZM20.9 20a1.4 1.4 0 1 1-2.8 0 1.4 1.4 0 0 1 2.8 0Z"
      stroke="#fff"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const StreakDayTrack = ({ currentDay }: { currentDay: number }) => {
  const styles = usePromoReturnStreakDockStyles();
  const safeDay = Math.max(1, Math.min(PROMO_RETURN_STREAK_MAX_DAY, currentDay));

  return (
    <View style={styles.track} accessibilityRole="list">
      {Array.from({ length: PROMO_RETURN_STREAK_MAX_DAY }, (_, index) => {
        const dayNumber = index + 1;
        const percent = PROMO_RETURN_STREAK_DISCOUNT_PERCENT_BY_DAY[dayNumber] ?? 0;
        const isCurrent = dayNumber === safeDay;
        const isDone = dayNumber < safeDay;
        const percentActive = isDone || isCurrent;

        return (
          <View key={dayNumber} style={styles.tick}>
            <View
              style={[
                styles.tickDot,
                isDone && styles.tickDotDone,
                isCurrent && styles.tickDotCurrent,
              ]}
            >
              {isDone ? (
                <Svg width={13.6} height={13.6} viewBox="0 0 16 16">
                  <Path
                    d="M3.2 8.4 6.5 11.6 12.8 4.4"
                    fill="none"
                    stroke={L.claimText}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              ) : null}
            </View>
            <Text style={styles.tickLabel}>
              {PROMO_RETURN_STREAK_DOCK_UI.DAY_TICK(dayNumber)}
            </Text>
            <Text
              style={[styles.tickPercent, percentActive && styles.tickPercentActive]}
            >
              {PROMO_RETURN_STREAK_DOCK_UI.DISCOUNT(percent)}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

/**
 * Нижний dock: день streak и «Забрать» — паритет web `PromoReturnStreakDock`.
 * После claim скрывается (`canClaim === false`).
 */
export const PromoReturnStreakDock = () => {
  const styles = usePromoReturnStreakDockStyles();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const sessionQuery = useAuthSessionQuery();
  const isAuthorized = sessionQuery.data?.user != null;
  const streakQuery = useMyPromoReturnStreakQuery({ enabled: isAuthorized });
  const claimMutation = useClaimPromoReturnStreakMutation();

  const contentMaxWidth = useMemo(
    () => resolveContentMaxWidth(windowWidth),
    [windowWidth],
  );
  const horizontalInset = resolveMobileBottomNavHorizontalInset(insets);
  const navLayoutHeight = resolveMobileBottomNavLayoutHeight(insets.bottom);
  const bottom = navLayoutHeight + L.gapAboveNav;

  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          translateY: (1 - homeCatalogTabBarRevealProgress.value) * (bottom + 80),
        },
      ],
    }),
    [bottom],
  );

  const handleClaim = useCallback(() => {
    if (claimMutation.isPending) {
      return;
    }
    claimMutation.mutate();
  }, [claimMutation]);

  if (!isAuthorized) {
    return null;
  }

  const streak = streakQuery.data;
  if (!streak && streakQuery.isLoading) {
    return null;
  }
  if (!streak?.canClaim) {
    return null;
  }

  const shownDay = streak.displayDay;
  const shownPercent = streak.displayDiscountPercent;
  const errorMessage =
    claimMutation.error instanceof Error
      ? claimMutation.error.message
      : streakQuery.error instanceof Error
        ? streakQuery.error.message
        : "";

  return (
    <View
      pointerEvents="box-none"
      style={[styles.shell, { bottom, paddingHorizontal: Math.max(0, horizontalInset - L.inset) }]}
    >
      <Animated.View
        style={[
          animatedStyle,
          contentMaxWidth != null
            ? { maxWidth: contentMaxWidth, alignSelf: "center", width: "100%" }
            : null,
        ]}
      >
        <View
          style={styles.dock}
          accessibilityLabel={PROMO_RETURN_STREAK_DOCK_UI.TITLE}
        >
          <View style={styles.top}>
            <View style={styles.icon} accessibilityElementsHidden>
              <StreakDiscountIcon />
            </View>
            <View style={styles.headline}>
              <Text style={styles.eyebrow}>{PROMO_RETURN_STREAK_DOCK_UI.EYEBROW}</Text>
              <Text style={styles.days}>
                {PROMO_RETURN_STREAK_DOCK_UI.DAY_BOLD(
                  shownDay,
                  PROMO_RETURN_STREAK_MAX_DAY,
                )}
              </Text>
              <Text style={styles.subline}>
                {`${PROMO_RETURN_STREAK_DOCK_UI.DISCOUNT(shownPercent)} · ${PROMO_RETURN_STREAK_DOCK_UI.TOMORROW(streak.tomorrowDiscountPercent)}`}
              </Text>
            </View>
            <Pressable
              style={[styles.claim, claimMutation.isPending && styles.claimDisabled]}
              disabled={claimMutation.isPending}
              accessibilityRole="button"
              accessibilityLabel={PROMO_RETURN_STREAK_DOCK_UI.CLAIM_ARIA}
              onPress={handleClaim}
            >
              <Text style={styles.claimLabel}>
                {claimMutation.isPending
                  ? PROMO_RETURN_STREAK_DOCK_UI.CLAIM_PENDING
                  : PROMO_RETURN_STREAK_DOCK_UI.CLAIM}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.description}>
            {PROMO_RETURN_STREAK_DOCK_UI.DESCRIPTION}
          </Text>
          <View style={styles.rule} accessibilityElementsHidden />
          <StreakDayTrack currentDay={shownDay} />

          {errorMessage ? (
            <Text style={styles.error} accessibilityRole="alert">
              {errorMessage}
            </Text>
          ) : null}
        </View>
      </Animated.View>
    </View>
  );
};
