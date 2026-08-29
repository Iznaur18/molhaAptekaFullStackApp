import { useEffect, useMemo, useState } from "react";
import { Platform, type ViewStyle } from "react-native";
import { Easing } from "react-native-reanimated";

import { CHECKOUT_SHEET_MODAL_ANIMATION } from "@/features/checkout/lib/checkoutSheetModalAnimation";
import { scheduleOpenAfterPaint } from "@/shared/lib/scheduleOpenAfterPaint";
import { useAdminEditModalAnimation } from "@/shared/model/useAdminEditModalAnimation";

const { enterMs, exitMs, enterEasingCss, exitEasingCss } =
  CHECKOUT_SHEET_MODAL_ANIMATION;

const enterEasing = Easing.bezierFn(0.215, 0.61, 0.355, 1);
const exitEasing = Easing.bezierFn(0.55, 0.055, 0.675, 1);

type CheckoutSheetModalAnimation = {
  modalVisible: boolean;
  backdropAnimatedStyle: ViewStyle;
  sheetAnimatedStyle: ViewStyle;
  useCssTransition: boolean;
};

export const useCheckoutSheetModalAnimation = (
  visible: boolean,
  sheetSlideDistance: number,
): CheckoutSheetModalAnimation => {
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
      transform: [{ translateY: webOpen ? 0 : slideDistance }],
      transitionProperty: "transform",
      transitionDuration: `${webOpen ? enterMs : exitMs}ms`,
      transitionTimingFunction: webOpen ? enterEasingCss : exitEasingCss,
    }),
    [slideDistance, webOpen],
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
