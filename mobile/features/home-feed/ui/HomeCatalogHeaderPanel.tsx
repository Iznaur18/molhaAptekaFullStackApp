import { type ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";

import { HomeCatalogHeaderAccent } from "@/features/home-feed/ui/HomeCatalogHeaderAccent";
import { HomeCatalogHeaderGlassLayer } from "@/features/home-feed/ui/HomeCatalogHeaderGlassLayer";
import { useHomeCatalogHeaderStyles } from "@/shared/theme/homeCatalogHeaderStyles";

type HomeCatalogHeaderPanelProps = {
  children: ReactNode;
  paddingTop: number;
  style?: StyleProp<ViewStyle>;
  /** Без рамки, тени и inset-линии — для sticky foreground-sheet. */
  flatSheet?: boolean;
  /** Web v2 pill panel (не мержить с Ozon full-bleed). */
  floating?: boolean;
};

export const HomeCatalogHeaderPanel = ({
  children,
  paddingTop,
  style,
  flatSheet = false,
  floating = false,
}: HomeCatalogHeaderPanelProps) => {
  const styles = useHomeCatalogHeaderStyles();

  const panelStyle = floating
    ? [styles.panelFloating, flatSheet && styles.panelFlatSheet, { paddingTop }, style]
    : [styles.panel, flatSheet && styles.panelFlatSheet, { paddingTop }, style];

  return (
    <View style={panelStyle}>
      {flatSheet || floating ? null : (
        <>
          <HomeCatalogHeaderGlassLayer />
          <HomeCatalogHeaderAccent />
          <View style={styles.panelInsetLine} pointerEvents="none" />
        </>
      )}
      {floating && !flatSheet ? (
        <HomeCatalogHeaderGlassLayer style={styles.panelFloatingGlass} />
      ) : null}
      <View style={styles.panelContent}>{children}</View>
    </View>
  );
};
