import { Text, View } from "react-native";

import { isProductOutOfStock } from "@/entities/product/lib/isProductOutOfStock";
import { resolveProductOutOfStockOverlayLabel } from "@/entities/product/lib/resolveProductOutOfStockOverlayLabel";
import { AddToCartButton } from "@/features/cart-add/ui/AddToCartButton";
import { FIXED_FONT_PROPS } from "@/shared/lib/fixedTypography";
import { useProductDetailPurchaseActionsStyles } from "@/shared/theme/catalogProductStyles";
import {
  PRODUCT_DETAIL_DOCK_CTA_BORDER_RADIUS,
  useAddToCartButtonStyles,
} from "@/shared/theme/uploadFieldStyles";
import { SquircleView } from "@/shared/ui/SquircleView";

type ProductDetailPurchaseActionsProps = {
  productId: string;
  product: Record<string, unknown>;
  canShowAddToCart: boolean;
  showOutOfStockPurchaseButton?: boolean;
  variant?: "inline" | "dock";
};

export const ProductDetailPurchaseActions = ({
  productId,
  product,
  canShowAddToCart,
  showOutOfStockPurchaseButton = false,
  variant = "inline",
}: ProductDetailPurchaseActionsProps) => {
  const styles = useProductDetailPurchaseActionsStyles();
  const addToCartStyles = useAddToCartButtonStyles();
  const outOfStock =
    showOutOfStockPurchaseButton || (!canShowAddToCart && isProductOutOfStock(product));

  if (variant === "inline" || (!canShowAddToCart && !outOfStock)) {
    return null;
  }

  if (outOfStock) {
    return (
      <View style={styles.dockRoot}>
        <View style={styles.cartSlot}>
          <SquircleView
            radius={PRODUCT_DETAIL_DOCK_CTA_BORDER_RADIUS}
            style={[addToCartStyles.detailDockAddButton, addToCartStyles.buttonDisabled]}
          >
            <Text style={addToCartStyles.detailDockAddButtonText} {...FIXED_FONT_PROPS}>
              {resolveProductOutOfStockOverlayLabel(product)}
            </Text>
          </SquircleView>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.dockRoot}>
      <View style={styles.cartSlot}>
        <AddToCartButton productId={productId} product={product} variant="detailDock" />
      </View>
    </View>
  );
};
