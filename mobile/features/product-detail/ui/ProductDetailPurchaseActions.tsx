import { View } from "react-native";

import { isProductOutOfStock } from "@/entities/product/lib/isProductOutOfStock";
import { resolveProductOutOfStockOverlayLabel } from "@/entities/product/lib/resolveProductOutOfStockOverlayLabel";
import { AddToCartButton } from "@/features/cart-add/ui/AddToCartButton";
import { ADD_TO_CART_UI } from "@/shared/config";
import { BlockedPurchaseButton } from "@/shared/ui/BlockedPurchaseButton";
import { useProductDetailPurchaseActionsStyles } from "@/shared/theme/catalogProductStyles";

type ProductDetailPurchaseActionsProps = {
  productId: string;
  product: Record<string, unknown>;
  canShowAddToCart: boolean;
  showOutOfStockPurchaseButton?: boolean;
  showBlockedPurchaseButton?: boolean;
  showSellerClosedPurchaseButton?: boolean;
  blockedPurchaseLabel?: string;
  sellerClosedPurchaseLabel?: string;
  variant?: "inline" | "dock";
};

export const ProductDetailPurchaseActions = ({
  productId,
  product,
  canShowAddToCart,
  showOutOfStockPurchaseButton = false,
  showBlockedPurchaseButton = false,
  showSellerClosedPurchaseButton = false,
  blockedPurchaseLabel = ADD_TO_CART_UI.BLOCKED,
  sellerClosedPurchaseLabel = ADD_TO_CART_UI.SELLER_CLOSED,
  variant = "inline",
}: ProductDetailPurchaseActionsProps) => {
  const styles = useProductDetailPurchaseActionsStyles();
  const outOfStock =
    showOutOfStockPurchaseButton || (!canShowAddToCart && isProductOutOfStock(product));
  const outOfStockLabel = resolveProductOutOfStockOverlayLabel(product);
  const buttonVariant = variant === "dock" ? "detailDock" : "default";

  if (
    !canShowAddToCart &&
    !showOutOfStockPurchaseButton &&
    !showBlockedPurchaseButton &&
    !showSellerClosedPurchaseButton &&
    !outOfStock
  ) {
    return null;
  }

  if (showBlockedPurchaseButton) {
    return (
      <View style={variant === "dock" ? styles.dockRoot : styles.inlineRoot}>
        <View style={variant === "dock" ? styles.cartSlot : undefined}>
          <BlockedPurchaseButton label={blockedPurchaseLabel} variant={buttonVariant} />
        </View>
      </View>
    );
  }

  if (outOfStock) {
    return (
      <View style={variant === "dock" ? styles.dockRoot : styles.inlineRoot}>
        <View style={variant === "dock" ? styles.cartSlot : undefined}>
          <BlockedPurchaseButton label={outOfStockLabel} variant={buttonVariant} />
        </View>
      </View>
    );
  }

  if (showSellerClosedPurchaseButton) {
    return (
      <View style={variant === "dock" ? styles.dockRoot : styles.inlineRoot}>
        <View style={variant === "dock" ? styles.cartSlot : undefined}>
          <BlockedPurchaseButton label={sellerClosedPurchaseLabel} variant={buttonVariant} />
        </View>
      </View>
    );
  }

  return (
    <View style={variant === "dock" ? styles.dockRoot : styles.inlineRoot}>
      <View style={variant === "dock" ? styles.cartSlot : undefined}>
        <AddToCartButton productId={productId} product={product} variant={buttonVariant} />
      </View>
    </View>
  );
};
