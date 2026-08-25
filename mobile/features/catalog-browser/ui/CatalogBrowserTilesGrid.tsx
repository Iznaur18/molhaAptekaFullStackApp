import { type ReactNode } from "react";
import { View, Text } from "react-native";

import type { CatalogBrowserLandingSectionVariant } from "@/features/catalog-browser/lib/catalogBrowserLandingLayout";
import { useCatalogBrowserSectionStyles } from "@/shared/theme/catalogProductStyles";

type CatalogBrowserTilesGridProps = {
  title: string;
  accessibilityLabel?: string;
  gap: number;
  variant?: CatalogBrowserLandingSectionVariant;
  children: ReactNode;
};

export const CatalogBrowserTilesGrid = ({
  title,
  accessibilityLabel,
  gap,
  variant = "categories",
  children,
}: CatalogBrowserTilesGridProps) => {
  const styles = useCatalogBrowserSectionStyles();
  const isFeed = variant === "feed";

  return (
    <View
      style={isFeed ? styles.sectionFeed : styles.sectionCategories}
      accessibilityLabel={accessibilityLabel}
      accessible={Boolean(accessibilityLabel)}
    >
      <Text
        style={[styles.sectionTitle, !isFeed && styles.sectionTitleCategories]}
      >
        {title}
      </Text>
      <View style={[styles.grid, { gap }]}>{children}</View>
    </View>
  );
};
