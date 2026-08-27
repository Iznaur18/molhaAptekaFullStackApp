import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { ADMIN_EDIT_MODAL_ANIMATION } from "@/shared/theme/modalChromeStyles";
import { scheduleOpenAfterPaint } from "@/shared/lib/scheduleOpenAfterPaint";

type SheetModalEasing = (value: number) => number;

type UseSheetModalAnimationOptions = {
  onDismissed?: () => void;
  sheetSlideDistance?: number;
  enterMs?: number;
  exitMs?: number;
  enterEasing?: SheetModalEasing;
  exitEasing?: SheetModalEasing;
  /** Web parity: mount closed, animate on next paint. */
  deferEnterUntilPaint?: boolean;
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
  const enterEasing = options.enterEasing ?? Easing.out(Easing.cubic);
  const exitEasing = options.exitEasing ?? Easing.in(Easing.cubic);
  const deferEnterUntilPaint = options.deferEnterUntilPaint ?? false;
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
  const enterEasingRef = useRef(enterEasing);
  const exitEasingRef = useRef(exitEasing);
  const deferEnterRef = useRef(deferEnterUntilPaint);

  onDismissedRef.current = options.onDismissed;
  modalVisibleRef.current = modalVisible;
  slideDistanceRef.current = slideDistance;
  enterMsRef.current = enterMs;
  exitMsRef.current = exitMs;
  enterEasingRef.current = enterEasing;
  exitEasingRef.current = exitEasing;
  deferEnterRef.current = deferEnterUntilPaint;

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
    const enterEase = enterEasingRef.current;
    const exitEase = exitEasingRef.current;

    const runEnter = () => {
      backdropOpacity.value = withTiming(1, {
        duration: enterDuration,
        easing: enterEase,
      });
      sheetTranslateY.value = withTiming(0, {
        duration: enterDuration,
        easing: enterEase,
      });
    };

    if (visible && !wasVisible) {
      setModalVisible(true);
      backdropOpacity.value = 0;
      sheetTranslateY.value = distance;

      if (deferEnterRef.current || Platform.OS === "web") {
        return scheduleOpenAfterPaint(runEnter);
      }

      runEnter();
      return undefined;
    }

    if (!visible && wasVisible && modalVisibleRef.current) {
      backdropOpacity.value = withTiming(0, {
        duration: exitDuration,
        easing: exitEase,
      });
      sheetTranslateY.value = withTiming(
        distance,
        {
          duration: exitDuration,
          easing: exitEase,
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

    return undefined;
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
