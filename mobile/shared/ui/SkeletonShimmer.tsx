import { useEffect, type ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

type SkeletonShimmerProps = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Оборачивает статичный скелетон в «дышащую» подсветку: плавная пульсация
 * прозрачности на UI-потоке (Reanimated worklet, 60 FPS), без нагрузки на JS
 * и без нативных зависимостей. Даёт понятный сигнал «данные грузятся, не завис».
 */
export const SkeletonShimmer = ({ children, style }: SkeletonShimmerProps) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 850, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    return () => cancelAnimation(progress);
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0.4, 1]),
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
};
