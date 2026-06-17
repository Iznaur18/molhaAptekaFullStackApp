import { type ReactNode } from "react";
import { View, Text } from "react-native";

import { useCatalogBrowserSectionStyles } from "@/shared/theme/catalogProductStyles";

type CatalogBrowserTilesGridProps = {
  title: string;
  accessibilityLabel?: string;
  gap: number;
  children: ReactNode;
};

export const CatalogBrowserTilesGrid = ({
  title,
  accessibilityLabel,
  gap,
  children,
}: CatalogBrowserTilesGridProps) => {
  const styles = useCatalogBrowserSectionStyles();

  return (
    <View
      style={styles.section}
      accessibilityLabel={accessibilityLabel}
      accessible={Boolean(accessibilityLabel)}
    >
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={[styles.grid, { gap }]}>{children}</View>
    </View>
  );
};
