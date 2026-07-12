import { memo } from "react";
import { View } from "react-native";

import { ProductCard } from "@/entities/product/ui/ProductCard";
import { ProductCardBanner } from "@/entities/product/ui/ProductCardBanner";
import { CatalogGridRowEnteringShell } from "@/features/catalog-grid/ui/CatalogGridRowEnteringShell";

import type { CatalogGridRow } from "../lib/buildCatalogGridRows";
import { catalogGridRowStyles } from "../lib/catalogGridLayout";

type CatalogGridRowItemProps = {
  row: CatalogGridRow;
  columns: number;
  gap: number;
  tileWidth: number;
  rowIndex?: number;
  disableEntering?: boolean;
};

export const CatalogGridRowItem = memo(({
  row,
  columns,
  gap,
  tileWidth,
  rowIndex = 0,
  disableEntering = false,
}: CatalogGridRowItemProps) => {
  if (!row) {
    return null;
  }

  const content =
    row.kind === "tier3-banner" ? (
      <ProductCardBanner product={row.product} />
    ) : (
      <View style={[catalogGridRowStyles.row, { gap }]}>
        {row.products.map((product) => (
          <View key={product._id} style={{ width: tileWidth }}>
            <ProductCard product={product} layout="catalog-grid" />
          </View>
        ))}
        {row.products.length < columns
          ? Array.from({ length: columns - row.products.length }, (_, index) => (
              <View key={`catalog-grid-pad-${index}`} style={{ width: tileWidth }} />
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
