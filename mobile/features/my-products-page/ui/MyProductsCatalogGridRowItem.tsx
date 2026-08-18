import { View } from "react-native";

import { MyProductCatalogCard } from "@/entities/product/ui/MyProductCatalogCard";
import { ProductCardBanner } from "@/entities/product/ui/ProductCardBanner";
import { CatalogGridRowEnteringShell } from "@/features/catalog-grid/ui/CatalogGridRowEnteringShell";

import type { CatalogGridRow } from "@/features/catalog-grid/lib/buildCatalogGridRows";
import { catalogGridRowStyles } from "@/features/catalog-grid/lib/catalogGridLayout";

type MyProductsCatalogProduct = Record<string, unknown> & { _id: string };

type MyProductsCatalogGridRowItemProps = {
  row: CatalogGridRow;
  columns: number;
  gap: number;
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

  return (
    <CatalogGridRowEnteringShell rowIndex={rowIndex}>
      <View style={[catalogGridRowStyles.row, { gap }]}>
        {row.products.map((product) => (
          <View key={product._id} style={{ width: tileWidth }}>
            <MyProductCatalogCard
              product={product}
              isLoyaltyPointsOvercommitted={resolveLoyaltyOvercommitted(product)}
              onEditProduct={() => onEditProduct(product)}
              onCopyProduct={() => onCopyProduct(product)}
              onPromoteProduct={() => onPromoteProduct(product)}
            />
          </View>
        ))}
        {row.products.length < columns
          ? Array.from({ length: columns - row.products.length }, (_, index) => (
              <View key={`my-products-grid-pad-${index}`} style={{ width: tileWidth }} />
            ))
          : null}
      </View>
    </CatalogGridRowEnteringShell>
  );
};
