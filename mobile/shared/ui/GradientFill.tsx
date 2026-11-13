import { StyleSheet, View, type ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

type GradientFillProps = {
  /** Два цвета диагонального градиента (135deg, как web linear-gradient). */
  colors: [string, string];
  style?: ViewStyle;
};

let gradientSeq = 0;

/**
 * Диагональный градиент на всю подложку — замена CSS
 * `linear-gradient(135deg, …)` для кнопок-карточек.
 */
export const GradientFill = ({ colors, style }: GradientFillProps) => {
  const id = `gradientFill${(gradientSeq += 1)}`;
  return (
    <View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors[0]} />
            <Stop offset="1" stopColor={colors[1]} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
};
