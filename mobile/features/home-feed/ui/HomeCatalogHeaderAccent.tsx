import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { HOME_CATALOG_HEADER_ACCENT_HEIGHT } from "@/shared/lib/homeCatalogHeaderLayout";
import { useAppThemeSettings } from "@/shared/theme/AppThemeProvider";
import { useHomeCatalogHeaderStyles } from "@/shared/theme/homeCatalogHeaderStyles";

const ACCENT_GRADIENT_ID = "homeCatalogHeaderAccent";

const HEADER_ACCENT_LIGHT = "#93c5fd";

export const HomeCatalogHeaderAccent = () => {
  const styles = useHomeCatalogHeaderStyles();
  const { theme } = useAppThemeSettings();

  return (
    <Svg
      style={styles.accentSlot}
      width="100%"
      height={HOME_CATALOG_HEADER_ACCENT_HEIGHT}
      pointerEvents="none"
    >
      <Defs>
        <LinearGradient id={ACCENT_GRADIENT_ID} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={theme.colors.action} />
          <Stop offset="0.45" stopColor={HEADER_ACCENT_LIGHT} />
          <Stop offset="1" stopColor={theme.colors.action} />
        </LinearGradient>
      </Defs>
      <Rect
        x="0"
        y="0"
        width="100%"
        height={HOME_CATALOG_HEADER_ACCENT_HEIGHT}
        fill={`url(#${ACCENT_GRADIENT_ID})`}
      />
    </Svg>
  );
};
