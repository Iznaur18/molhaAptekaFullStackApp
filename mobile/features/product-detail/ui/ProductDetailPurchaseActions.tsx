import { View } from "react-native";

import { AddToCartButton } from "@/features/cart-add/ui/AddToCartButton";
import { useProductDetailPurchaseActionsStyles } from "@/shared/theme/catalogProductStyles";

type ProductDetailPurchaseActionsProps = {
  productId: string;
  product: Record<string, unknown>;
  canShowAddToCart: boolean;
  variant?: "inline" | "dock";
};

export const ProductDetailPurchaseActions = ({
  productId,
  product,
  canShowAddToCart,
  variant = "inline",
}: ProductDetailPurchaseActionsProps) => {
  const styles = useProductDetailPurchaseActionsStyles();

  if (variant === "inline" || !canShowAddToCart) {
    return null;
  }

  return (
    <View style={styles.dockRoot}>
      <View style={styles.cartSlot}>
        <AddToCartButton productId={productId} product={product} variant="detailDock" />
      </View>
    </View>
  );
};
