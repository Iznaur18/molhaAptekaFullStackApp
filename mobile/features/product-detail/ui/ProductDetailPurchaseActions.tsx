import { Text, View } from "react-native";

import { isProductOutOfStock } from "@/entities/product/lib/isProductOutOfStock";
import { PRODUCT_DETAIL_OUT_OF_STOCK_BUTTON_LAYOUT as OOS_BTN } from "@/entities/product/lib/productDetailOutOfStockButtonLayout";
import { resolveProductOutOfStockOverlayLabel } from "@/entities/product/lib/resolveProductOutOfStockOverlayLabel";
import { AddToCartButton } from "@/features/cart-add/ui/AddToCartButton";
import { FIXED_FONT_PROPS } from "@/shared/lib/fixedTypography";
import { useProductDetailPurchaseActionsStyles } from "@/shared/theme/catalogProductStyles";
import { useAddToCartButtonStyles } from "@/shared/theme/uploadFieldStyles";
import { SquircleView } from "@/shared/ui/SquircleView";

type ProductDetailPurchaseActionsProps = {
  productId: string;
  product: Record<string, unknown>;
  canShowAddToCart: boolean;
  showOutOfStockPurchaseButton?: boolean;
  variant?: "inline" | "dock";
};

const OutOfStockPurchaseButton = ({ label }: { label: string }) => {
  const addToCartStyles = useAddToCartButtonStyles();

  return (
    <SquircleView
      radius={OOS_BTN.borderRadius}
      style={addToCartStyles.detailOutOfStockButton}
    >
      <Text style={addToCartStyles.detailOutOfStockButtonText} {...FIXED_FONT_PROPS}>
        {label}
      </Text>
    </SquircleView>
  );
};

export const ProductDetailPurchaseActions = ({
  productId,
  product,
  canShowAddToCart,
  showOutOfStockPurchaseButton = false,
  variant = "inline",
}: ProductDetailPurchaseActionsProps) => {
  const styles = useProductDetailPurchaseActionsStyles();
  const outOfStock =
    showOutOfStockPurchaseButton || (!canShowAddToCart && isProductOutOfStock(product));
  const outOfStockLabel = resolveProductOutOfStockOverlayLabel(product);

  if (!canShowAddToCart && !showOutOfStockPurchaseButton && !outOfStock) {
    return null;
  }

  if (variant === "inline") {
    if (outOfStock) {
      return (
        <View style={styles.inlineRoot}>
          <OutOfStockPurchaseButton label={outOfStockLabel} />
        </View>
      );
    }

    return (
      <View style={styles.inlineRoot}>
        <AddToCartButton productId={productId} product={product} variant="default" />
      </View>
    );
  }

  if (outOfStock) {
    return (
      <View style={styles.dockRoot}>
        <View style={styles.cartSlot}>
          <OutOfStockPurchaseButton label={outOfStockLabel} />
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
