import { useEffect, useState, type ReactNode } from "react";
import { AccessibilityInfo, Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { ORDER_CARD_UI } from "@/shared/config";
import { useOrderCardStyles } from "@/shared/theme/commerceScreenStyles";

/** web `.order-card__details-fold*` — 350ms ease-in-out; reduce → 100ms. */
const DETAILS_FOLD_MS = 350;
const DETAILS_FOLD_REDUCED_MS = 100;
const DETAILS_FOLD_SLIDE_Y = 5.6; // 0.35rem

type OrderCardDetailsFoldProps = {
  children: ReactNode;
};

export const OrderCardDetailsFold = ({ children }: OrderCardDetailsFoldProps) => {
  const styles = useOrderCardStyles();
  const [expanded, setExpanded] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const progress = useSharedValue(0);
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
    const duration = reduceMotion ? DETAILS_FOLD_REDUCED_MS : DETAILS_FOLD_MS;
    progress.value = withTiming(expanded ? 1 : 0, {
      duration,
      easing: Easing.inOut(Easing.ease),
    });
  }, [expanded, progress, reduceMotion]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 90}deg` }],
  }));

  const panelStyle = useAnimatedStyle(() => ({
    height: progress.value * contentHeight.value,
    overflow: "hidden" as const,
  }));

  const bodyStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * -DETAILS_FOLD_SLIDE_Y }],
  }));

  return (
    <View style={styles.detailsFold}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((value) => !value)}
        style={styles.detailsFoldSummaryPressable}
      >
        <Animated.View style={chevronStyle} accessibilityElementsHidden>
          <Text style={styles.detailsFoldChevron}>▸</Text>
        </Animated.View>
        <Text style={styles.detailsFoldSummaryLabel}>
          {ORDER_CARD_UI.DETAILS_FOLD_SUMMARY}
        </Text>
      </Pressable>
      <Animated.View style={panelStyle}>
        <View
          onLayout={(event) => {
            contentHeight.value = event.nativeEvent.layout.height;
          }}
        >
          <Animated.View
            style={[styles.detailsFoldBody, bodyStyle]}
            // Body stays mounted like web grid 0fr→1fr; pointer when closed.
            pointerEvents={expanded ? "auto" : "none"}
          >
            {children}
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
};
