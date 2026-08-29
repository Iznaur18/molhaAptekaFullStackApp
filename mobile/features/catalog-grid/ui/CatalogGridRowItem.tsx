import { memo } from "react";
import { View } from "react-native";

import { ProductCard } from "@/entities/product/ui/ProductCard";
import { ProductCardBanner } from "@/entities/product/ui/ProductCardBanner";
import { CatalogGridRowEnteringShell } from "@/features/catalog-grid/ui/CatalogGridRowEnteringShell";
import { resolveFlexGridItemWidthStyle } from "@/shared/lib/resolveFlexGridItemWidth";
import { AppText } from "@/shared/ui/AppText";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";

import type { CatalogGridRow } from "../lib/buildCatalogGridRows";
import { catalogGridRowStyles } from "../lib/catalogGridLayout";

type CatalogGridRowItemProps = {
  row: CatalogGridRow;
  columns: number;
  gap: number;
  contentWidth: number;
  tileWidth: number;
  rowIndex?: number;
  disableEntering?: boolean;
  highlightRaffleProduct?: boolean;
};

export const CatalogGridRowItem = memo(({
  row,
  columns,
  gap,
  contentWidth,
  tileWidth,
  rowIndex = 0,
  disableEntering = false,
  highlightRaffleProduct = false,
}: CatalogGridRowItemProps) => {
  const theme = useAppTheme();

  if (!row) {
    return null;
  }

  const cellWidthStyle =
    columns <= 1
      ? { width: "100%" as const, minWidth: 0 }
      : resolveFlexGridItemWidthStyle({ contentWidth, columns, gap });

  const content =
    row.kind === "section-header" ? (
      <AppText
        style={{
          marginTop: 16,
          marginBottom: 8,
          fontSize: 17,
          fontWeight: "700",
          lineHeight: 22,
          color: theme.colors.ink,
        }}
        accessibilityRole="header"
      >
        {row.title}
      </AppText>
    ) : row.kind === "tier3-banner" ? (
      <ProductCardBanner product={row.product} />
    ) : (
      <View style={[catalogGridRowStyles.row, { gap }]}>
        {row.products.map((product) => (
          <View key={product._id} style={cellWidthStyle}>
            <ProductCard
              product={product}
              layout="catalog-grid"
              catalogGridTileWidth={tileWidth}
              highlightRaffleProduct={highlightRaffleProduct}
            />
          </View>
        ))}
        {columns > 1 && row.products.length < columns
          ? Array.from({ length: columns - row.products.length }, (_, index) => (
              <View key={`catalog-grid-pad-${index}`} style={cellWidthStyle} />
            ))
          : null}
      </View>
    );

  return (
    <CatalogGridRowEnteringShell rowIndex={rowIndex} disableEntering={disableEntering}>
      {content}
    </CatalogGridRowEnteringShell>
  );
});

CatalogGridRowItem.displayName = "CatalogGridRowItem";
