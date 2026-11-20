import { Pressable, Text, View } from "react-native";

import { isProductOutOfStock } from "@/entities/product/lib/isProductOutOfStock";
import { resolveProductOutOfStockOverlayLabel } from "@/entities/product/lib/resolveProductOutOfStockOverlayLabel";
import { AddToCartButton } from "@/features/cart-add/ui/AddToCartButton";
import { ADD_TO_CART_UI, PRODUCT_DETAILS_MODAL_UI } from "@/shared/config";
import { BlockedPurchaseButton } from "@/shared/ui/BlockedPurchaseButton";
import { useProductDetailPurchaseActionsStyles } from "@/shared/theme/catalogProductStyles";

type ProductDetailPurchaseActionsProps = {
  productId: string;
  product: Record<string, unknown>;
  canShowAddToCart: boolean;
  showOutOfStockPurchaseButton?: boolean;
  showBlockedPurchaseButton?: boolean;
  showSellerClosedPurchaseButton?: boolean;
  /** Своё объявление — неактивная «Свой товар» (web `showOwnProductPurchaseButton`). */
  showOwnProductPurchaseButton?: boolean;
  blockedPurchaseLabel?: string;
  sellerClosedPurchaseLabel?: string;
  variant?: "inline" | "dock";
  /** Паритет web dock `onBack` → кнопка «Назад». */
  onBack?: () => void;
};

export const ProductDetailPurchaseActions = ({
  productId,
  product,
  canShowAddToCart,
  showOutOfStockPurchaseButton = false,
  showBlockedPurchaseButton = false,
  showSellerClosedPurchaseButton = false,
  showOwnProductPurchaseButton = false,
  blockedPurchaseLabel = ADD_TO_CART_UI.BLOCKED,
  sellerClosedPurchaseLabel = ADD_TO_CART_UI.SELLER_CLOSED,
  variant = "inline",
  onBack,
}: ProductDetailPurchaseActionsProps) => {
  const styles = useProductDetailPurchaseActionsStyles();
  const outOfStock =
    showOutOfStockPurchaseButton || (!canShowAddToCart && isProductOutOfStock(product));
  const outOfStockLabel = resolveProductOutOfStockOverlayLabel(product);
  const buttonVariant = variant === "dock" ? "detailDock" : "default";
  const isDock = variant === "dock";
  const showDockBack = isDock && typeof onBack === "function";

  if (
    !canShowAddToCart &&
    !showOutOfStockPurchaseButton &&
    !showBlockedPurchaseButton &&
    !showSellerClosedPurchaseButton &&
    !showOwnProductPurchaseButton &&
    !outOfStock
  ) {
    return null;
  }

  const renderCart = () => {
    // Первым, как в web `ProductPurchaseCartButton`: своё — даже если нет в наличии.
    if (showOwnProductPurchaseButton) {
      return (
        <BlockedPurchaseButton
          label={ADD_TO_CART_UI.OWN_PRODUCT}
          variant={buttonVariant}
        />
      );
    }
    if (showBlockedPurchaseButton) {
      return (
        <BlockedPurchaseButton label={blockedPurchaseLabel} variant={buttonVariant} />
      );
    }
    if (outOfStock) {
      return (
        <BlockedPurchaseButton label={outOfStockLabel} variant={buttonVariant} />
      );
    }
    if (showSellerClosedPurchaseButton) {
      return (
        <BlockedPurchaseButton
          label={sellerClosedPurchaseLabel}
          variant={buttonVariant}
        />
      );
    }
    return (
      <AddToCartButton
        productId={productId}
        product={product}
        variant={buttonVariant}
      />
    );
  };

  return (
    <View style={isDock ? styles.dockRoot : styles.inlineRoot}>
      {showDockBack ? (
        <Pressable
          style={styles.dockBackButton}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel={PRODUCT_DETAILS_MODAL_UI.BACK_ARIA}
        >
          <Text style={styles.dockBackButtonText}>
            {PRODUCT_DETAILS_MODAL_UI.BACK_ARIA}
          </Text>
        </Pressable>
      ) : null}
      <View style={isDock ? styles.cartSlot : undefined}>{renderCart()}</View>
    </View>
  );
};
