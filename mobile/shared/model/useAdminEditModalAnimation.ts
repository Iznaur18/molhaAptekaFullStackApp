import { useCallback, useEffect, useRef, useState } from "react";
import {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { ADMIN_EDIT_MODAL_ANIMATION } from "@/shared/theme/modalChromeStyles";

type UseSheetModalAnimationOptions = {
  onDismissed?: () => void;
  sheetSlideDistance?: number;
  enterMs?: number;
  exitMs?: number;
};

export const useAdminEditModalAnimation = (
  visible: boolean,
  onDismissedOrOptions?: (() => void) | UseSheetModalAnimationOptions,
) => {
  const options: UseSheetModalAnimationOptions =
    typeof onDismissedOrOptions === "function"
      ? { onDismissed: onDismissedOrOptions }
      : (onDismissedOrOptions ?? {});

  const enterMs = options.enterMs ?? ADMIN_EDIT_MODAL_ANIMATION.enterMs;
  const exitMs = options.exitMs ?? ADMIN_EDIT_MODAL_ANIMATION.exitMs;
  const slideDistance =
    options.sheetSlideDistance ?? ADMIN_EDIT_MODAL_ANIMATION.sheetSlideDistance;

  const [modalVisible, setModalVisible] = useState(false);
  const backdropOpacity = useSharedValue(0);
  const sheetTranslateY = useSharedValue<number>(slideDistance);
  const wasVisibleRef = useRef(false);
  const modalVisibleRef = useRef(false);
  const onDismissedRef = useRef(options.onDismissed);
  const slideDistanceRef = useRef(slideDistance);
  const enterMsRef = useRef(enterMs);
  const exitMsRef = useRef(exitMs);

  onDismissedRef.current = options.onDismissed;
  modalVisibleRef.current = modalVisible;
  slideDistanceRef.current = slideDistance;
  enterMsRef.current = enterMs;
  exitMsRef.current = exitMs;

  const finishClose = useCallback(() => {
    if (!modalVisibleRef.current) {
      return;
    }
    setModalVisible(false);
    onDismissedRef.current?.();
  }, []);

  useEffect(() => {
    const wasVisible = wasVisibleRef.current;
    wasVisibleRef.current = visible;
    const distance = slideDistanceRef.current;
    const enterDuration = enterMsRef.current;
    const exitDuration = exitMsRef.current;

    if (visible && !wasVisible) {
      setModalVisible(true);
      backdropOpacity.value = 0;
      sheetTranslateY.value = distance;
      backdropOpacity.value = withTiming(1, {
        duration: enterDuration,
        easing: Easing.out(Easing.cubic),
      });
      sheetTranslateY.value = withTiming(0, {
        duration: enterDuration,
        easing: Easing.out(Easing.cubic),
      });
      return;
    }

    if (!visible && wasVisible && modalVisibleRef.current) {
      backdropOpacity.value = withTiming(0, {
        duration: exitDuration,
        easing: Easing.in(Easing.cubic),
      });
      sheetTranslateY.value = withTiming(
        distance,
        {
          duration: exitDuration,
          easing: Easing.in(Easing.cubic),
        },
        (finished) => {
          if (finished) {
            runOnJS(finishClose)();
          }
        },
      );

      const fallbackMs = exitDuration + 80;
      const timeoutId = setTimeout(() => {
        if (!wasVisibleRef.current && modalVisibleRef.current) {
          finishClose();
        }
      }, fallbackMs);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [backdropOpacity, finishClose, sheetTranslateY, visible]);

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.value }],
  }));

  return {
    modalVisible,
    backdropAnimatedStyle,
    sheetAnimatedStyle,
  };
};
