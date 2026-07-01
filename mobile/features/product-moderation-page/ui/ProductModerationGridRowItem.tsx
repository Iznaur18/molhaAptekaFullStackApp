import { View } from "react-native";

import type { ModerationProduct } from "@/entities/product/api/productModerationApi";
import { ProductCard } from "@/entities/product/ui/ProductCard";
import type { ProductModerationActions } from "@/entities/product/ui/ProductModerationDetailsFooter";
import type { CatalogGridRow } from "@/features/catalog-grid/lib/buildCatalogGridRows";
import { catalogGridRowStyles } from "@/features/catalog-grid/lib/catalogGridLayout";

type ProductModerationGridRowItemProps = {
  row: CatalogGridRow;
  columns: number;
  gap: number;
  tileWidth: number;
  rejectComments: Record<string, string>;
  cardErrors: Record<string, string>;
  pendingProductId: string | null;
  onRejectCommentChange: (productId: string, value: string) => void;
  onApprove: (productId: string) => void;
  onReject: (productId: string) => void;
};

const buildModerationActions = (
  productId: string,
  props: Omit<ProductModerationGridRowItemProps, "row" | "columns" | "gap" | "tileWidth">,
): ProductModerationActions => ({
  rejectComment: props.rejectComments[productId] ?? "",
  onRejectCommentChange: (value) => props.onRejectCommentChange(productId, value),
  onApprove: () => props.onApprove(productId),
  onReject: () => props.onReject(productId),
  isBusy: props.pendingProductId === productId,
  errorMessage: props.cardErrors[productId] ?? "",
});

export const ProductModerationGridRowItem = ({
  row,
  columns,
  gap,
  tileWidth,
  ...actionProps
}: ProductModerationGridRowItemProps) => {
  if (row.kind !== "product-cells") {
    return null;
  }

  return (
    <View style={[catalogGridRowStyles.row, { gap }]}>
      {row.products.map((product) => {
        const productId = String(product._id);

        return (
          <View key={productId} style={{ width: tileWidth }}>
            <ProductCard
              product={product as ModerationProduct}
              layout="catalog-grid"
              highlightCatalogPromotion={false}
              isModerationQueue
              moderationActions={buildModerationActions(productId, actionProps)}
            />
          </View>
        );
      })}
      {row.products.length < columns
        ? Array.from({ length: columns - row.products.length }, (_, index) => (
            <View key={`product-moderation-grid-pad-${index}`} style={{ width: tileWidth }} />
          ))
        : null}
    </View>
  );
};
