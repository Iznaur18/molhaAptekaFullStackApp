import { useEffect, useMemo, useState } from "react";
import { Platform, type ViewStyle } from "react-native";
import { Easing } from "react-native-reanimated";

import { VIEWER_REGION_PICKER_SHEET_ANIMATION } from "@/entities/region/lib/viewerRegionPickerSheetAnimation";
import { useAdminEditModalAnimation } from "@/shared/model/useAdminEditModalAnimation";
import { scheduleOpenAfterPaint } from "@/shared/lib/scheduleOpenAfterPaint";

const {
  enterMs,
  exitMs,
  enterEasingCss,
  exitEasingCss,
} = VIEWER_REGION_PICKER_SHEET_ANIMATION;

const enterEasing = Easing.bezierFn(0.215, 0.61, 0.355, 1);
const exitEasing = Easing.bezierFn(0.55, 0.055, 0.675, 1);

type ViewerRegionPickerSheetAnimation = {
  modalVisible: boolean;
  backdropAnimatedStyle: ViewStyle;
  sheetAnimatedStyle: ViewStyle;
  useCssTransition: boolean;
};

export const useViewerRegionPickerSheetAnimation = (
  open: boolean,
  sheetSlideDistance: number,
): ViewerRegionPickerSheetAnimation => {
  const isWeb = Platform.OS === "web";

  const nativeAnimation = useAdminEditModalAnimation(open, {
    sheetSlideDistance,
    enterMs,
    exitMs,
    enterEasing,
    exitEasing,
    deferEnterUntilPaint: true,
  });

  const [webMounted, setWebMounted] = useState(false);
  const [webOpen, setWebOpen] = useState(false);

  useEffect(() => {
    if (!isWeb) {
      return undefined;
    }

    if (open) {
      setWebMounted(true);
      return scheduleOpenAfterPaint(() => {
        setWebOpen(true);
      });
    }

    setWebOpen(false);

    if (!webMounted) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setWebMounted(false);
    }, exitMs);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isWeb, open, webMounted]);

  const webBackdropStyle = useMemo(
    (): ViewStyle => ({
      opacity: webOpen ? 1 : 0,
      transitionProperty: "opacity",
      transitionDuration: `${webOpen ? enterMs : exitMs}ms`,
      transitionTimingFunction: webOpen ? enterEasingCss : exitEasingCss,
    }),
    [webOpen],
  );

  const webSheetStyle = useMemo(
    (): ViewStyle => ({
      transform: [{ translateY: webOpen ? 0 : sheetSlideDistance }],
      transitionProperty: "transform",
      transitionDuration: `${webOpen ? enterMs : exitMs}ms`,
      transitionTimingFunction: webOpen ? enterEasingCss : exitEasingCss,
    }),
    [sheetSlideDistance, webOpen],
  );

  if (isWeb) {
    return {
      modalVisible: webMounted,
      backdropAnimatedStyle: webBackdropStyle,
      sheetAnimatedStyle: webSheetStyle,
      useCssTransition: true,
    };
  }

  return {
    ...nativeAnimation,
    useCssTransition: false,
  };
};
