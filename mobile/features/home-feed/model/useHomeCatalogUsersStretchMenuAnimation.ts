import { useEffect, useMemo, useState } from "react";
import { Platform, type ViewStyle } from "react-native";
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
  HOME_CATALOG_HEADER_USERS_STRETCH_ANIMATION_EASING_CSS,
  HOME_CATALOG_HEADER_USERS_STRETCH_ANIMATION_MS,
  resolveHomeCatalogUsersStretchMenuHeight,
} from "@/shared/lib/homeCatalogHeaderLayout";
import { scheduleOpenAfterPaint } from "@/shared/lib/scheduleOpenAfterPaint";

const stretchEasing = Easing.bezier(0.33, 1, 0.68, 1);

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
  const isWeb = Platform.OS === "web";
  const expandedHeight = resolveHomeCatalogUsersStretchMenuHeight(itemCount);
  const progress = useSharedValue(open ? 1 : 0);
  const [portalVisible, setPortalVisible] = useState(open);
  const [menuExpanded, setMenuExpanded] = useState(false);

  useEffect(() => {
    if (open) {
      setPortalVisible(true);
      setMenuExpanded(false);

      return scheduleOpenAfterPaint(() => {
        setMenuExpanded(true);

        if (!isWeb) {
          progress.value = 0;
          progress.value = withTiming(1, {
            duration: HOME_CATALOG_HEADER_USERS_STRETCH_ANIMATION_MS,
            easing: stretchEasing,
          });
        }
      });
    }

    setMenuExpanded(false);

    if (!portalVisible) {
      return undefined;
    }

    if (!isWeb) {
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

      const fallbackId = setTimeout(() => {
        setPortalVisible(false);
      }, HOME_CATALOG_HEADER_USERS_STRETCH_ANIMATION_MS + 80);

      return () => {
        clearTimeout(fallbackId);
      };
    }

    const timeoutId = setTimeout(() => {
      setPortalVisible(false);
    }, HOME_CATALOG_HEADER_USERS_STRETCH_ANIMATION_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isWeb, open, portalVisible, progress]);

  const nativeShellAnimatedStyle = useAnimatedStyle(() => ({
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

  const nativeItemsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.92, 1]) }],
  }));

  const webShellStyle = useMemo(
    (): ViewStyle => ({
      height: menuExpanded ? expandedHeight : HOME_CATALOG_HEADER_CIRCLE_BUTTON_SIZE,
      backgroundColor: menuExpanded ? openBackgroundColor : closedBackgroundColor,
      borderColor: menuExpanded ? openBorderColor : closedBorderColor,
      transitionProperty: "height, background-color, border-color",
      transitionDuration: `${HOME_CATALOG_HEADER_USERS_STRETCH_ANIMATION_MS}ms`,
      transitionTimingFunction: HOME_CATALOG_HEADER_USERS_STRETCH_ANIMATION_EASING_CSS,
    }),
    [
      closedBackgroundColor,
      closedBorderColor,
      expandedHeight,
      menuExpanded,
      openBackgroundColor,
      openBorderColor,
    ],
  );

  const webItemsStyle = useMemo(
    (): ViewStyle => ({
      opacity: menuExpanded ? 1 : 0,
      transform: [{ scale: menuExpanded ? 1 : 0.92 }],
      transitionProperty: "opacity, transform",
      transitionDuration: `${HOME_CATALOG_HEADER_USERS_STRETCH_ANIMATION_MS}ms`,
      transitionTimingFunction: HOME_CATALOG_HEADER_USERS_STRETCH_ANIMATION_EASING_CSS,
    }),
    [menuExpanded],
  );

  return {
    portalVisible,
    menuExpanded,
    shellAnimatedStyle: isWeb ? webShellStyle : nativeShellAnimatedStyle,
    itemsAnimatedStyle: isWeb ? webItemsStyle : nativeItemsAnimatedStyle,
    useCssTransition: isWeb,
  };
};
