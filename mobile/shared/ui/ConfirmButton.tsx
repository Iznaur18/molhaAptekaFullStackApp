import { useEffect, useState } from "react";
import {
  AccessibilityInfo,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { BlurView } from "expo-blur";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { FORMAT_BOOLEAN_RU } from "@/shared/config";
import { CONFIRM_POPOVER_CHROME } from "@/shared/lib/confirmPopoverChrome";
import { useConfirmButtonStyles } from "@/shared/theme/confirmButtonStyles";

/** web `AUTO_CANCEL_MS` / scrim exit. */
const AUTO_CANCEL_MS = 8000;
const SCRIM_IN_MS = 300;
const SCRIM_OUT_MS = 250;

type ConfirmButtonProps = {
  label: string;
  question: string;
  onConfirm: () => void;
  disabled?: boolean;
  pendingLabel?: string;
  isPending?: boolean;
  /** Пока только popover — паритет OrderCard web. */
  variant?: "popover";
  triggerStyle?: StyleProp<ViewStyle>;
  triggerTextStyle?: StyleProp<TextStyle>;
};

export const ConfirmButton = ({
  label,
  question,
  onConfirm,
  disabled = false,
  pendingLabel = "",
  isPending = false,
  triggerStyle,
  triggerTextStyle,
}: ConfirmButtonProps) => {
  const styles = useConfirmButtonStyles();
  const [asking, setAsking] = useState(false);
  const [portalMounted, setPortalMounted] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const progress = useSharedValue(0);

  useEffect(() => {
    let alive = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (alive) setReduceMotion(Boolean(enabled));
    });
    const sub = AccessibilityInfo.addEventListener?.(
      "reduceMotionChanged",
      (enabled: boolean) => setReduceMotion(Boolean(enabled)),
    );
    return () => {
      alive = false;
      sub?.remove?.();
    };
  }, []);

  useEffect(() => {
    if (!asking) return undefined;
    const timer = setTimeout(() => setAsking(false), AUTO_CANCEL_MS);
    return () => clearTimeout(timer);
  }, [asking]);

  useEffect(() => {
    const durationIn = reduceMotion ? 0 : SCRIM_IN_MS;
    const durationOut = reduceMotion ? 0 : SCRIM_OUT_MS;

    if (asking) {
      setPortalMounted(true);
      progress.value = 0;
      progress.value = withTiming(1, {
        duration: durationIn,
        easing: Easing.out(Easing.ease),
      });
      return undefined;
    }

    if (!portalMounted) return undefined;

    progress.value = withTiming(
      0,
      {
        duration: durationOut,
        easing: Easing.in(Easing.ease),
      },
      (finished) => {
        if (finished) {
          runOnJS(setPortalMounted)(false);
        }
      },
    );
    return undefined;
  }, [asking, portalMounted, progress, reduceMotion]);

  const scrimStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const popoverStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: (1 - progress.value) * 6 },
      { scale: 0.96 + progress.value * 0.04 },
    ],
  }));

  const closeAsking = () => setAsking(false);
  const triggerLabel = isPending && pendingLabel ? pendingLabel : label;

  return (
    <View style={styles.root}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: asking, disabled: disabled || isPending }}
        disabled={disabled || isPending}
        onPress={() => setAsking((open) => !open)}
        style={triggerStyle}
      >
        <Text style={triggerTextStyle}>{triggerLabel}</Text>
      </Pressable>

      <Modal
        visible={portalMounted}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeAsking}
      >
        <View style={styles.portal} pointerEvents="box-none">
          <Animated.View style={[StyleSheet.absoluteFillObject, scrimStyle]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={FORMAT_BOOLEAN_RU.NO}
              onPress={closeAsking}
              style={StyleSheet.absoluteFillObject}
            >
              <BlurView
                intensity={CONFIRM_POPOVER_CHROME.scrimBlurPx * 10}
                tint="dark"
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.scrim} />
            </Pressable>
          </Animated.View>

          <Animated.View
            style={[styles.popover, popoverStyle]}
            accessibilityViewIsModal
            accessibilityLabel={question}
          >
            <Text style={styles.question}>{question}</Text>
            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                onPress={closeAsking}
                style={styles.noButton}
              >
                <Text style={styles.noButtonText}>{FORMAT_BOOLEAN_RU.NO}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  closeAsking();
                  onConfirm();
                }}
                style={styles.yesButton}
              >
                <Text style={styles.yesButtonText}>{FORMAT_BOOLEAN_RU.YES}</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};
