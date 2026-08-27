import { useEffect, useMemo, useState } from "react";
import { Platform, type ViewStyle } from "react-native";
import { Easing } from "react-native-reanimated";

import { CREATE_USER_STORY_MODAL_LAYOUT as L } from "@/entities/user-story/lib/createUserStoryModalLayout";
import { scheduleOpenAfterPaint } from "@/shared/lib/scheduleOpenAfterPaint";
import { useAdminEditModalAnimation } from "@/shared/model/useAdminEditModalAnimation";

const { enterMs, exitMs, sheetEnterEasing, sheetEnterEasingCss } = L;

const enterEasing = Easing.bezierFn(
  sheetEnterEasing[0],
  sheetEnterEasing[1],
  sheetEnterEasing[2],
  sheetEnterEasing[3],
);

type CreateUserStoryModalAnimation = {
  modalVisible: boolean;
  backdropAnimatedStyle: ViewStyle;
  sheetAnimatedStyle: ViewStyle;
  useCssTransition: boolean;
};

/** Паритет client `useCreateUserStoryModalAnimation` + CSS transitions на Expo web. */
export const useCreateUserStoryModalAnimation = (
  open: boolean,
  sheetSlideDistance: number,
  onDismissed?: () => void,
): CreateUserStoryModalAnimation => {
  const isWeb = Platform.OS === "web";

  const nativeAnimation = useAdminEditModalAnimation(open, {
    sheetSlideDistance,
    enterMs,
    exitMs,
    enterEasing,
    exitEasing: enterEasing,
    deferEnterUntilPaint: true,
    onDismissed,
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
      onDismissed?.();
    }, exitMs);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isWeb, onDismissed, open, webMounted]);

  const webBackdropStyle = useMemo(
    (): ViewStyle => ({
      opacity: webOpen ? 1 : 0,
      transitionProperty: "opacity",
      transitionDuration: `${webOpen ? enterMs : exitMs}ms`,
      transitionTimingFunction: sheetEnterEasingCss,
    }),
    [webOpen],
  );

  const webSheetStyle = useMemo(
    (): ViewStyle => ({
      transform: [{ translateY: webOpen ? 0 : sheetSlideDistance }],
      transitionProperty: "transform",
      transitionDuration: `${webOpen ? enterMs : exitMs}ms`,
      transitionTimingFunction: sheetEnterEasingCss,
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
