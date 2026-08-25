import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { isDimColorScheme } from "@izibuy/design-tokens";

import {
  HOME_CATALOG_HEADER_PANEL_BLUR_RADIUS,
  resolveHomeCatalogHeaderGlassTint,
} from "@/shared/lib/homeCatalogHeaderLayout";
import { useAppTheme, useAppThemeSettings } from "@/shared/theme/AppThemeProvider";

type HomeCatalogHeaderGlassLayerProps = {
  style?: StyleProp<ViewStyle>;
};

export const HomeCatalogHeaderGlassLayer = ({ style }: HomeCatalogHeaderGlassLayerProps = {}) => {
  const theme = useAppTheme();
  const { colorScheme } = useAppThemeSettings();
  const glassTint = resolveHomeCatalogHeaderGlassTint(theme.colors.onContrast);

  if (Platform.OS === "web") {
    return (
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: glassTint,
            backdropFilter: `blur(${HOME_CATALOG_HEADER_PANEL_BLUR_RADIUS}px)`,
            // @ts-expect-error RN Web CSS
            WebkitBackdropFilter: `blur(${HOME_CATALOG_HEADER_PANEL_BLUR_RADIUS}px)`,
          },
          style,
        ]}
      />
    );
  }

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, style]}>
      <BlurView
        intensity={HOME_CATALOG_HEADER_PANEL_BLUR_RADIUS * 4}
        tint={isDimColorScheme(colorScheme) ? "dark" : "light"}
        style={StyleSheet.absoluteFillObject}
      />
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, { backgroundColor: glassTint }]}
      />
    </View>
  );
};
