import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { RAFFLE_FEATURED_PALETTE as P } from "@/entities/raffle/lib/raffleFeaturedPalette";

type RaffleFeaturedBannerBackgroundProps = {
  style?: StyleProp<ViewStyle>;
};

export const RaffleFeaturedBannerBackground = ({
  style,
}: RaffleFeaturedBannerBackgroundProps) => (
  <View
    style={[StyleSheet.absoluteFill, { backgroundColor: P.surface }, style]}
    pointerEvents="none"
  />
);
