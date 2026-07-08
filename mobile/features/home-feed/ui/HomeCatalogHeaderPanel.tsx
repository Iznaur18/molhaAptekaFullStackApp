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
};

export const HomeCatalogHeaderPanel = ({
  children,
  paddingTop,
  style,
  flatSheet = false,
}: HomeCatalogHeaderPanelProps) => {
  const styles = useHomeCatalogHeaderStyles();

  return (
    <View style={[styles.panel, flatSheet && styles.panelFlatSheet, { paddingTop }, style]}>
      {flatSheet ? null : (
        <>
          <HomeCatalogHeaderGlassLayer />
          <HomeCatalogHeaderAccent />
          <View style={styles.panelInsetLine} pointerEvents="none" />
        </>
      )}
      <View style={styles.panelContent}>{children}</View>
    </View>
  );
};
