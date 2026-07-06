import { useCallback, useEffect, useRef, useState } from "react";
import {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { ADMIN_EDIT_MODAL_ANIMATION } from "@/shared/theme/modalChromeStyles";

const { enterMs, exitMs, sheetSlideDistance } = ADMIN_EDIT_MODAL_ANIMATION;

export const useAdminEditModalAnimation = (visible: boolean, onDismissed?: () => void) => {
  const [modalVisible, setModalVisible] = useState(false);
  const backdropOpacity = useSharedValue(0);
  const sheetTranslateY = useSharedValue(sheetSlideDistance);
  const wasVisibleRef = useRef(false);
  const modalVisibleRef = useRef(false);
  const onDismissedRef = useRef(onDismissed);
  onDismissedRef.current = onDismissed;
  modalVisibleRef.current = modalVisible;

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

    if (visible && !wasVisible) {
      setModalVisible(true);
      backdropOpacity.value = 0;
      sheetTranslateY.value = sheetSlideDistance;
      backdropOpacity.value = withTiming(1, {
        duration: enterMs,
        easing: Easing.out(Easing.cubic),
      });
      sheetTranslateY.value = withTiming(0, {
        duration: enterMs,
        easing: Easing.out(Easing.cubic),
      });
      return;
    }

    if (!visible && wasVisible && modalVisibleRef.current) {
      backdropOpacity.value = withTiming(0, {
        duration: exitMs,
        easing: Easing.in(Easing.cubic),
      });
      sheetTranslateY.value = withTiming(
        sheetSlideDistance,
        {
          duration: exitMs,
          easing: Easing.in(Easing.cubic),
        },
        (finished) => {
          if (finished) {
            runOnJS(finishClose)();
          }
        },
      );

      const fallbackMs = exitMs + 80;
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
