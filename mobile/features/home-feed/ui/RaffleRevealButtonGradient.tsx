import { useId, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { mixHexColors } from "@/shared/lib/mixHexColors";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";

/** Web `color-mix(in srgb, action 82%, #ffb37a)`. */
const REVEAL_GRADIENT_LIGHT = "#ffb37a";
/** Web `color-mix(in srgb, action 88%, #d63c00)`. */
const REVEAL_GRADIENT_DEEP = "#d63c00";

/**
 * Горизонтальный градиент кнопки «Открыть розыгрыш» —
 * паритет `RaffleFeaturedHomeSection.css` `linear-gradient(90deg, …)`.
 */
export const RaffleRevealButtonGradient = () => {
  const theme = useAppTheme();
  const gradientId = useId().replace(/:/g, "");
  const colors = useMemo(() => {
    const action = theme.colors.action;
    return {
      start: mixHexColors(action, REVEAL_GRADIENT_LIGHT, 0.82),
      mid: action,
      end: mixHexColors(action, REVEAL_GRADIENT_DEEP, 0.88),
    };
  }, [theme.colors.action]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={colors.start} />
            <Stop offset="0.55" stopColor={colors.mid} />
            <Stop offset="1" stopColor={colors.end} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${gradientId})`} />
      </Svg>
    </View>
  );
};
