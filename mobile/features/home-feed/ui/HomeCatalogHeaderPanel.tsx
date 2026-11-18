import { type ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";

import { useHomeCatalogHeaderStyles } from "@/shared/theme/homeCatalogHeaderStyles";

type HomeCatalogHeaderPanelProps = {
  children: ReactNode;
  paddingTop: number;
  style?: StyleProp<ViewStyle>;
  /** Без нижнего зазора — для sticky foreground-sheet. */
  flatSheet?: boolean;
};

/** Web v2: прозрачная панель, без капсулы, стекла и accent. */
export const HomeCatalogHeaderPanel = ({
  children,
  paddingTop,
  style,
  flatSheet = false,
}: HomeCatalogHeaderPanelProps) => {
  const styles = useHomeCatalogHeaderStyles();

  return (
    <View
      style={[
        styles.panelFloating,
        flatSheet && styles.panelFlatSheet,
        { paddingTop },
        style,
      ]}
    >
      <View style={styles.panelContent}>{children}</View>
    </View>
  );
};
