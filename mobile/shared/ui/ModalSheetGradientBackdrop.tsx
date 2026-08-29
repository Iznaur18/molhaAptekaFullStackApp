import { Platform, StyleSheet, View, type ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import {
  MODAL_SHEET_BACKDROP_STOPS,
  buildModalSheetBackdropGradientCss,
} from "@/shared/lib/modalSheetBackdropGradient";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";

const MODAL_SHEET_BACKDROP_GRADIENT_ID = "modalSheetBackdropGradient";

/** Постепенное затемнение сверху вниз — сильнее у нижнего края sheet. */
export const ModalSheetGradientBackdrop = () => {
  const theme = useAppTheme();
  const ink = theme.colors.ink;

  if (Platform.OS === "web") {
    return (
      <View
        style={
          {
            ...StyleSheet.absoluteFillObject,
            backgroundImage: buildModalSheetBackdropGradientCss(ink),
          } as ViewStyle
        }
        pointerEvents="none"
      />
    );
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={MODAL_SHEET_BACKDROP_GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
            {MODAL_SHEET_BACKDROP_STOPS.map(({ offset, opacity }) => (
              <Stop
                key={offset}
                offset={String(offset)}
                stopColor={ink}
                stopOpacity={String(opacity)}
              />
            ))}
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${MODAL_SHEET_BACKDROP_GRADIENT_ID})`} />
      </Svg>
    </View>
  );
};
