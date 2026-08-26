import { View } from "react-native";

import { MyProductCatalogCard } from "@/entities/product/ui/MyProductCatalogCard";
import { ProductCardBanner } from "@/entities/product/ui/ProductCardBanner";
import { CatalogGridRowEnteringShell } from "@/features/catalog-grid/ui/CatalogGridRowEnteringShell";

import type { CatalogGridRow } from "@/features/catalog-grid/lib/buildCatalogGridRows";
import { catalogGridRowStyles } from "@/features/catalog-grid/lib/catalogGridLayout";
import { resolveFlexGridItemWidthStyle } from "@/shared/lib/resolveFlexGridItemWidth";

type MyProductsCatalogProduct = Record<string, unknown> & { _id: string };

type MyProductsCatalogGridRowItemProps = {
  row: CatalogGridRow;
  columns: number;
  gap: number;
  contentWidth: number;
  tileWidth: number;
  rowIndex?: number;
  onEditProduct: (product: MyProductsCatalogProduct) => void;
  onCopyProduct: (product: MyProductsCatalogProduct) => void;
  onPromoteProduct: (product: MyProductsCatalogProduct) => void;
  resolveLoyaltyOvercommitted: (product: MyProductsCatalogProduct) => boolean;
};

export const MyProductsCatalogGridRowItem = ({
  row,
  columns,
  gap,
  contentWidth,
  tileWidth,
  rowIndex = 0,
  onEditProduct,
  onCopyProduct,
  onPromoteProduct,
  resolveLoyaltyOvercommitted,
}: MyProductsCatalogGridRowItemProps) => {
  if (row.kind === "tier3-banner") {
    return (
      <CatalogGridRowEnteringShell rowIndex={rowIndex}>
        <ProductCardBanner product={row.product} />
      </CatalogGridRowEnteringShell>
    );
  }

  if (row.kind === "section-header") {
    return null;
  }

  /** 1-col: 100% main-колонки (ProfileAccountShell), не tileWidth от полного viewport. */
  const cellWidthStyle =
    columns <= 1
      ? { width: "100%" as const, minWidth: 0 }
      : resolveFlexGridItemWidthStyle({ contentWidth, columns, gap });

  return (
    <CatalogGridRowEnteringShell rowIndex={rowIndex}>
      <View style={[catalogGridRowStyles.row, { gap, width: "100%", alignSelf: "stretch" }]}>
        {row.products.map((product) => (
          <View key={product._id} style={cellWidthStyle}>
            <MyProductCatalogCard
              product={product}
              isLoyaltyPointsOvercommitted={resolveLoyaltyOvercommitted(product)}
              onEditProduct={() => onEditProduct(product)}
              onCopyProduct={() => onCopyProduct(product)}
              onPromoteProduct={() => onPromoteProduct(product)}
            />
          </View>
        ))}
        {columns > 1 && row.products.length < columns
          ? Array.from({ length: columns - row.products.length }, (_, index) => (
              <View key={`my-products-grid-pad-${index}`} style={{ width: tileWidth }} />
            ))
          : null}
      </View>
    </CatalogGridRowEnteringShell>
  );
};
