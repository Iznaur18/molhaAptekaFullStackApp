import { useEffect, useId, useState } from "react";
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import {
  buildRepeatingRainbowGradientCss,
  RAFFLE_REVEAL_RAINBOW_COLORS,
  RAFFLE_REVEAL_RAINBOW_DURATION_MS,
} from "@/features/home-feed/lib/raffleRevealRainbow";

const KEYFRAMES_STYLE_ID = "raffle-reveal-rainbow-keyframes";

type RainbowFlowBackdropProps = {
  style?: StyleProp<ViewStyle>;
  colors?: readonly string[];
};

const ensureWebKeyframes = () => {
  if (Platform.OS !== "web" || typeof document === "undefined") {
    return;
  }
  if (document.getElementById(KEYFRAMES_STYLE_ID)) {
    return;
  }
  const style = document.createElement("style");
  style.id = KEYFRAMES_STYLE_ID;
  style.textContent = `@keyframes raffle-reveal-rainbow {
    from { background-position: 0% 0; }
    to { background-position: 100% 0; }
  }`;
  document.head.appendChild(style);
};

const RainbowFlowBackdropWeb = ({
  style,
  colors = RAFFLE_REVEAL_RAINBOW_COLORS,
}: RainbowFlowBackdropProps) => {
  useEffect(() => {
    ensureWebKeyframes();
  }, []);

  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFillObject,
        style,
        {
          // RN Web: CSS flow как у Banner variant="rainbow"
          backgroundImage: buildRepeatingRainbowGradientCss(colors),
          backgroundSize: "200% 100%",
          filter: "saturate(2)",
          animationName: "raffle-reveal-rainbow",
          animationDuration: `${RAFFLE_REVEAL_RAINBOW_DURATION_MS}ms`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
        } as ViewStyle,
      ]}
    />
  );
};

const RainbowFlowBackdropNative = ({
  style,
  colors = RAFFLE_REVEAL_RAINBOW_COLORS,
}: RainbowFlowBackdropProps) => {
  const gradientId = useId().replace(/:/g, "");
  const [width, setWidth] = useState(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: RAFFLE_REVEAL_RAINBOW_DURATION_MS,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
    return () => cancelAnimation(progress);
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(progress.value, [0, 1], [0, width > 0 ? -width : 0]),
      },
    ],
  }));

  const stripWidth = Math.max(width * 2, 1);
  const stops = [...colors, colors[0]];

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFillObject, styles.nativeClip, style]}
      onLayout={(event) => {
        const nextWidth = Math.round(event.nativeEvent.layout.width);
        if (nextWidth > 0 && nextWidth !== width) {
          setWidth(nextWidth);
        }
      }}
    >
      {width > 0 ? (
        <Animated.View style={[{ width: stripWidth, height: "100%" }, animatedStyle]}>
          <Svg width={stripWidth} height="100%" style={StyleSheet.absoluteFillObject}>
            <Defs>
              <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0.35">
                {stops.map((color, index) => (
                  <Stop
                    key={`${color}-${index}`}
                    offset={`${(index / (stops.length - 1)) * 100}%`}
                    stopColor={color}
                  />
                ))}
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width={stripWidth} height="100%" fill={`url(#${gradientId})`} />
          </Svg>
        </Animated.View>
      ) : null}
    </View>
  );
};

export const RainbowFlowBackdrop = (props: RainbowFlowBackdropProps) =>
  Platform.OS === "web" ? (
    <RainbowFlowBackdropWeb {...props} />
  ) : (
    <RainbowFlowBackdropNative {...props} />
  );

const styles = StyleSheet.create({
  nativeClip: {
    overflow: "hidden",
  },
});
