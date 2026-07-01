import { View } from "react-native";

import { ProductCard } from "@/entities/product/ui/ProductCard";
import { ProductCardBanner } from "@/entities/product/ui/ProductCardBanner";

import type { CatalogGridRow } from "@/features/catalog-grid/lib/buildCatalogGridRows";
import { catalogGridRowStyles } from "@/features/catalog-grid/lib/catalogGridLayout";

type MyProductsCatalogProduct = Record<string, unknown> & { _id: string };

type MyProductsCatalogGridRowItemProps = {
  row: CatalogGridRow;
  columns: number;
  gap: number;
  tileWidth: number;
  onEditProduct: (product: MyProductsCatalogProduct) => void;
  onPromoteProduct: (product: MyProductsCatalogProduct) => void;
  resolveLoyaltyOvercommitted: (product: MyProductsCatalogProduct) => boolean;
};

export const MyProductsCatalogGridRowItem = ({
  row,
  columns,
  gap,
  tileWidth,
  onEditProduct,
  onPromoteProduct,
  resolveLoyaltyOvercommitted,
}: MyProductsCatalogGridRowItemProps) => {
  if (row.kind === "tier3-banner") {
    return <ProductCardBanner product={row.product} />;
  }

  return (
    <View style={[catalogGridRowStyles.row, { gap }]}>
      {row.products.map((product) => (
        <View key={product._id} style={{ width: tileWidth }}>
          <ProductCard
            product={product}
            layout="catalog-grid"
            highlightCatalogPromotion={false}
            isMineMode
            isLoyaltyPointsOvercommitted={resolveLoyaltyOvercommitted(product)}
            onEditProduct={() => onEditProduct(product)}
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
  );
};
