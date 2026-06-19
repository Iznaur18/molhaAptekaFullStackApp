import { View } from "react-native";

import { ProductCard } from "@/entities/product/ui/ProductCard";
import { ProductCardBanner } from "@/entities/product/ui/ProductCardBanner";

import type { CatalogGridRow } from "../lib/buildCatalogGridRows";
import { catalogGridRowStyles } from "../lib/catalogGridLayout";

type CatalogGridRowItemProps = {
  row: CatalogGridRow;
  columns: number;
  gap: number;
  tileWidth: number;
};

export const CatalogGridRowItem = ({
  row,
  columns,
  gap,
  tileWidth,
}: CatalogGridRowItemProps) => {
  if (row.kind === "tier3-banner") {
    return <ProductCardBanner product={row.product} />;
  }

  return (
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
};
