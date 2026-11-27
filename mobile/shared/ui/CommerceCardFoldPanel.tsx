import { useEffect, useState, type ReactNode } from "react";
import { AccessibilityInfo, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { COMMERCE_CARD_FOLD_LAYOUT as F } from "@/shared/lib/commerceCardFoldLayout";

type CommerceCardFoldPanelProps = {
  open: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  innerStyle?: StyleProp<ViewStyle>;
};

/**
 * Height fold как web `grid-template-rows: 0fr → 1fr` (InstallmentContractCard /
 * payments-fold). Контент остаётся в дереве для замера высоты.
 */
export const CommerceCardFoldPanel = ({
  open,
  children,
  style,
  innerStyle,
}: CommerceCardFoldPanelProps) => {
  const [reduceMotion, setReduceMotion] = useState(false);
  const progress = useSharedValue(open ? 1 : 0);
  const contentHeight = useSharedValue(0);

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
    const duration = reduceMotion ? F.reducedDurationMs : F.durationMs;
    progress.value = withTiming(open ? 1 : 0, {
      duration,
      easing: Easing.inOut(Easing.ease),
    });
  }, [open, progress, reduceMotion]);

  const panelStyle = useAnimatedStyle(() => ({
    height: progress.value * contentHeight.value,
    overflow: "hidden" as const,
  }));

  return (
    <Animated.View style={[panelStyle, style]} pointerEvents={open ? "auto" : "none"}>
      <View
        onLayout={(event) => {
          contentHeight.value = event.nativeEvent.layout.height;
        }}
      >
        <View style={innerStyle}>{children}</View>
      </View>
    </Animated.View>
  );
};
