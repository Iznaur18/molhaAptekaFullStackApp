import { izRadius } from "@izibuy/design-tokens";
import { useEffect, type ReactNode } from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

/** Web `skeleton.css` — `animation: iz-skeleton-shimmer 1.2s`. */
export const SKELETON_SHIMMER_DURATION_MS = 1200;

/** Web `.iz-skeleton { border-radius: 8px }`. */
export const SKELETON_BORDER_RADIUS = izRadius.sm;

type SkeletonShimmerProps = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Паритет web skeleton: цикл 1.2s + горизонтальный «блик» (gradient slide),
 * поверх opacity-пульса. Reduced-motion на RN не слушаем отдельно — блик мягкий.
 */
export const SkeletonShimmer = ({ children, style }: SkeletonShimmerProps) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: SKELETON_SHIMMER_DURATION_MS,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      false,
    );
    return () => cancelAnimation(progress);
  }, [progress]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.5, 1], [0.55, 1, 0.55]),
  }));

  const shineStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(progress.value, [0, 1], [-80, 80]),
      },
    ],
    opacity: interpolate(progress.value, [0, 0.35, 0.65, 1], [0, 0.35, 0.35, 0]),
  }));

  return (
    <Animated.View
      style={[styles.root, style, pulseStyle]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {children}
      <Animated.View pointerEvents="none" style={[styles.shine, shineStyle]} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: {
    overflow: "hidden",
    borderRadius: SKELETON_BORDER_RADIUS,
  },
  shine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: "42%",
    backgroundColor: "rgba(255,255,255,0.35)",
  },
});
