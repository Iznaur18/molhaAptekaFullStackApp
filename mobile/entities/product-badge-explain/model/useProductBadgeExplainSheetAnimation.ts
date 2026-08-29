import { useEffect, useMemo, useState } from "react";
import { Platform, type ViewStyle } from "react-native";
import { Easing } from "react-native-reanimated";

import { PRODUCT_BADGE_EXPLAIN_SHEET_LAYOUT } from "@/shared/lib/productBadgeExplainSheetLayout";
import { scheduleOpenAfterPaint } from "@/shared/lib/scheduleOpenAfterPaint";
import { useAdminEditModalAnimation } from "@/shared/model/useAdminEditModalAnimation";

const {
  enterMs,
  exitMs,
  enterEasingCss,
  exitEasingCss,
  panelMaxWidth,
  panelMaxHeightRatio,
  mediaAspectRatio,
} = PRODUCT_BADGE_EXPLAIN_SHEET_LAYOUT;

const enterEasing = Easing.bezierFn(0.215, 0.61, 0.355, 1);
const exitEasing = Easing.bezierFn(0.55, 0.055, 0.675, 1);

export const estimateProductBadgeExplainSheetSlideDistance = (
  windowWidth: number,
  windowHeight: number,
): number => {
  const panelWidth = Math.min(windowWidth, panelMaxWidth);
  const mediaHeight = panelWidth / mediaAspectRatio;
  const footerHeight = 73;
  const bodyHeight = 112;

  return Math.min(
    mediaHeight + footerHeight + bodyHeight,
    windowHeight * panelMaxHeightRatio,
  );
};

type ProductBadgeExplainSheetAnimation = {
  modalVisible: boolean;
  backdropAnimatedStyle: ViewStyle;
  sheetAnimatedStyle: ViewStyle;
  useCssTransition: boolean;
};

export const useProductBadgeExplainSheetAnimation = (
  visible: boolean,
  sheetSlideDistance: number,
): ProductBadgeExplainSheetAnimation => {
  const isWeb = Platform.OS === "web";
  const slideDistance = Math.max(sheetSlideDistance, 1);

  const nativeAnimation = useAdminEditModalAnimation(visible, {
    sheetSlideDistance: slideDistance,
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

    if (visible) {
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
  }, [isWeb, visible, webMounted]);

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
      transform: webOpen ? "translateY(0px)" : "translateY(100%)",
      transitionProperty: "transform",
      transitionDuration: `${webOpen ? enterMs : exitMs}ms`,
      transitionTimingFunction: webOpen ? enterEasingCss : exitEasingCss,
      willChange: "transform",
    }),
    [webOpen],
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
