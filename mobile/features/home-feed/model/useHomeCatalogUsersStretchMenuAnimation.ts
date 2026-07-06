import { useEffect, useState } from "react";
import {
  Easing,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import {
  HOME_CATALOG_HEADER_CIRCLE_BUTTON_SIZE,
  HOME_CATALOG_HEADER_USERS_STRETCH_ANIMATION_MS,
  resolveHomeCatalogUsersStretchMenuHeight,
} from "@/shared/lib/homeCatalogHeaderLayout";

const stretchEasing = Easing.out(Easing.cubic);

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
  const [portalVisible, setPortalVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setPortalVisible(true);
      progress.value = withTiming(1, {
        duration: HOME_CATALOG_HEADER_USERS_STRETCH_ANIMATION_MS,
        easing: stretchEasing,
      });
      return;
    }

    if (!portalVisible) {
      return;
    }

    progress.value = withTiming(
      0,
      {
        duration: HOME_CATALOG_HEADER_USERS_STRETCH_ANIMATION_MS,
        easing: stretchEasing,
      },
      (finished) => {
        if (finished) {
          runOnJS(setPortalVisible)(false);
        }
      },
    );
  }, [open, portalVisible, progress]);

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
    opacity: progress.value,
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.92, 1]) }],
  }));

  return {
    portalVisible,
    shellAnimatedStyle,
    itemsAnimatedStyle,
  };
};
