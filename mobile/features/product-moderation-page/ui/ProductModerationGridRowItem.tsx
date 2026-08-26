import { View } from "react-native";

import type { ModerationProduct } from "@/entities/product/api/productModerationApi";
import { ProductModerationQueueCard } from "@/entities/product/ui/ProductModerationQueueCard";
import type { ProductModerationActions } from "@/entities/product/ui/ProductModerationDetailsFooter";
import type { CatalogGridRow } from "@/features/catalog-grid/lib/buildCatalogGridRows";
import { catalogGridRowStyles } from "@/features/catalog-grid/lib/catalogGridLayout";
import { CatalogGridRowEnteringShell } from "@/features/catalog-grid/ui/CatalogGridRowEnteringShell";
import { resolveFlexGridItemWidthStyle } from "@/shared/lib/resolveFlexGridItemWidth";

type ProductModerationGridRowItemProps = {
  row: CatalogGridRow;
  columns: number;
  gap: number;
  contentWidth: number;
  tileWidth: number;
  rowIndex?: number;
  rejectComments: Record<string, string>;
  cardErrors: Record<string, string>;
  pendingProductId: string | null;
  canDelete?: boolean;
  onRejectCommentChange: (productId: string, value: string) => void;
  onApprove: (productId: string) => void;
  onReject: (productId: string) => void;
  onDelete?: (productId: string) => void;
};

const buildModerationActions = (
  productId: string,
  product: ModerationProduct,
  props: Omit<
    ProductModerationGridRowItemProps,
    "row" | "columns" | "gap" | "contentWidth" | "tileWidth"
  >,
): ProductModerationActions => ({
  rejectComment: props.rejectComments[productId] ?? "",
  onRejectCommentChange: (value) => props.onRejectCommentChange(productId, value),
  onApprove: () => props.onApprove(productId),
  onReject: () => props.onReject(productId),
  onDelete: props.canDelete && props.onDelete ? () => props.onDelete?.(productId) : undefined,
  canDelete: Boolean(props.canDelete),
  hasOpenSales: product.hasOpenSales === true,
  isBusy: props.pendingProductId === productId,
  errorMessage: props.cardErrors[productId] ?? "",
});

export const ProductModerationGridRowItem = ({
  row,
  columns,
  gap,
  contentWidth,
  tileWidth,
  rowIndex = 0,
  ...actionProps
}: ProductModerationGridRowItemProps) => {
  if (row.kind !== "product-cells") {
    return null;
  }

  const cellWidthStyle =
    columns <= 1
      ? { width: "100%" as const, minWidth: 0 }
      : resolveFlexGridItemWidthStyle({ contentWidth, columns, gap });

  return (
    <CatalogGridRowEnteringShell rowIndex={rowIndex}>
      <View style={[catalogGridRowStyles.row, { gap, width: "100%", alignSelf: "stretch" }]}>
        {row.products.map((product) => {
          const productId = String(product._id);

          return (
            <View key={productId} style={cellWidthStyle}>
              <ProductModerationQueueCard
                product={product as ModerationProduct}
                moderationActions={buildModerationActions(
                  productId,
                  product as ModerationProduct,
                  actionProps,
                )}
              />
            </View>
          );
        })}
        {columns > 1 && row.products.length < columns
          ? Array.from({ length: columns - row.products.length }, (_, index) => (
              <View key={`product-moderation-grid-pad-${index}`} style={{ width: tileWidth }} />
            ))
          : null}
      </View>
    </CatalogGridRowEnteringShell>
  );
};
