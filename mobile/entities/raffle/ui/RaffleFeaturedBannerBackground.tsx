import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { RAFFLE_FEATURED_PALETTE as P } from "@/entities/raffle/lib/raffleFeaturedPalette";

type RaffleFeaturedBannerBackgroundProps = {
  completed?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const RaffleFeaturedBannerBackground = ({
  completed = false,
  style,
}: RaffleFeaturedBannerBackgroundProps) => {
  const gradientId = completed ? "raffleBannerSuccess" : "raffleBannerPink";

  return (
    <View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="raffleBannerPink" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={P.accentPinkSurface} />
            <Stop offset="0.55" stopColor={P.accentPinkLilac} />
            <Stop offset="1" stopColor={P.surface} />
          </LinearGradient>
          <LinearGradient id="raffleBannerSuccess" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={P.successSurface} />
            <Stop offset="0.55" stopColor={P.successSoft} />
            <Stop offset="1" stopColor={P.surface} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${gradientId})`} />
      </Svg>
    </View>
  );
};
