import { useId, useMemo } from "react";
import { View, type ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { CATALOG_BROWSER_LANDING_LAYOUT as L } from "@/features/catalog-browser/lib/catalogBrowserLandingLayout";
import { mixHexColors } from "@/shared/lib/mixHexColors";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";

type CatalogSectionTitleAccentProps = {
  height: number;
  style?: ViewStyle;
};

/**
 * Вертикальный accent bar заголовка секции —
 * паритет `CatalogFeedTilesGrid.css` `::before` `linear-gradient(180deg, …)`.
 */
export const CatalogSectionTitleAccent = ({
  height,
  style,
}: CatalogSectionTitleAccentProps) => {
  const theme = useAppTheme();
  const gradientId = useId().replace(/:/g, "");
  const endColor = useMemo(
    () => mixHexColors(theme.colors.action, theme.colors.accent, 0.55),
    [theme.colors.action, theme.colors.accent],
  );

  return (
    <View
      style={[
        {
          width: L.titleAccentWidth,
          height,
          borderRadius: L.titleAccentRadius,
          overflow: "hidden",
          flexShrink: 0,
        },
        style,
      ]}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={theme.colors.action} />
            <Stop offset="1" stopColor={endColor} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${gradientId})`} />
      </Svg>
    </View>
  );
};
