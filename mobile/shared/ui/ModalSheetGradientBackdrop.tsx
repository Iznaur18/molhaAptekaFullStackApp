import { StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { semanticColors } from "@/shared/theme/semanticColors";

const MODAL_SHEET_BACKDROP_GRADIENT_ID = "modalSheetBackdropGradient";

/** Постепенное затемнение сверху вниз — сильнее у нижнего края sheet. */
export const ModalSheetGradientBackdrop = () => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <Svg width="100%" height="100%" preserveAspectRatio="none">
      <Defs>
        <LinearGradient id={MODAL_SHEET_BACKDROP_GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={semanticColors.ink} stopOpacity="0.28" />
          <Stop offset="0.38" stopColor={semanticColors.ink} stopOpacity="0.48" />
          <Stop offset="0.68" stopColor={semanticColors.ink} stopOpacity="0.68" />
          <Stop offset="1" stopColor={semanticColors.ink} stopOpacity="0.82" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${MODAL_SHEET_BACKDROP_GRADIENT_ID})`} />
    </Svg>
  </View>
);
