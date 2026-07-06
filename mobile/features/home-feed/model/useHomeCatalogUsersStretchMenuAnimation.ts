import { useEffect } from "react";
import {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import {
  HOME_CATALOG_HEADER_CIRCLE_BUTTON_SIZE,
  resolveHomeCatalogUsersStretchMenuHeight,
} from "@/shared/lib/homeCatalogHeaderLayout";

const STRETCH_ENTER_MS = 220;
const STRETCH_EXIT_MS = 180;

type UseHomeCatalogUsersStretchMenuAnimationParams = {
  open: boolean;
  itemCount: number;
  closedBackgroundColor: string;
  openBackgroundColor: string;
  closedBorderColor: string;
  openBorderColor: string;
};

export const useHomeCatalogUsersStretchMenuAnimation = ({
  open,
  itemCount,
  closedBackgroundColor,
  openBackgroundColor,
  closedBorderColor,
  openBorderColor,
}: UseHomeCatalogUsersStretchMenuAnimationParams) => {
  const expandedHeight = resolveHomeCatalogUsersStretchMenuHeight(itemCount);
  const progress = useSharedValue(open ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(open ? 1 : 0, {
      duration: open ? STRETCH_ENTER_MS : STRETCH_EXIT_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [open, progress]);

  const shellAnimatedStyle = useAnimatedStyle(() => ({
    height: interpolate(
      progress.value,
      [0, 1],
      [HOME_CATALOG_HEADER_CIRCLE_BUTTON_SIZE, expandedHeight],
    ),
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [closedBackgroundColor, openBackgroundColor],
    ),
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      [closedBorderColor, openBorderColor],
    ),
  }));

  const itemsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.35, 1], [0, 1]),
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.88, 1]) }],
  }));

  return {
    shellAnimatedStyle,
    itemsAnimatedStyle,
  };
};
