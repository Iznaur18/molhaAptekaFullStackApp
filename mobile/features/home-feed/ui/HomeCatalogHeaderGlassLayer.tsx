import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View } from "react-native";

import {
  HOME_CATALOG_HEADER_PANEL_BLUR_RADIUS,
  resolveHomeCatalogHeaderGlassTint,
} from "@/shared/lib/homeCatalogHeaderLayout";
import { useAppTheme, useAppThemeSettings } from "@/shared/theme/AppThemeProvider";

export const HomeCatalogHeaderGlassLayer = () => {
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
        ]}
      />
    );
  }

  return (
    <>
      <BlurView
        intensity={HOME_CATALOG_HEADER_PANEL_BLUR_RADIUS * 4}
        tint={colorScheme === "dark" ? "dark" : "light"}
        style={StyleSheet.absoluteFillObject}
      />
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, { backgroundColor: glassTint }]}
      />
    </>
  );
};
