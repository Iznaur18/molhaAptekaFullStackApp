import { Pressable, useWindowDimensions, View } from "react-native";

import { AddToCartButton } from "@/features/cart-add/ui/AddToCartButton";
import { SCREEN_NARROW_MAX_WIDTH as CATALOG_BROWSER_GRID_NARROW_MAX_WIDTH } from "@/shared/lib/screenBreakpoints";
import { INSTALLMENT_UI, PRODUCT_PRICE_OFFER_UI } from "@/shared/config";
import { useProductDetailPurchaseActionsStyles } from "@/shared/theme/catalogProductStyles";
import { AppText } from "@/shared/ui/AppText";

type ProductDetailPurchaseActionsProps = {
  productId: string;
  product: Record<string, unknown>;
  canShowAddToCart: boolean;
  auctionActive: boolean;
  installmentActive: boolean;
  onAuctionPress: () => void;
  onInstallmentPress: () => void;
  variant?: "inline" | "dock";
};

export const ProductDetailPurchaseActions = ({
  productId,
  product,
  canShowAddToCart,
  auctionActive,
  installmentActive,
  onAuctionPress,
  onInstallmentPress,
  variant = "inline",
}: ProductDetailPurchaseActionsProps) => {
  const styles = useProductDetailPurchaseActionsStyles();
  const { width: screenWidth } = useWindowDimensions();
  const isNarrowDock = screenWidth <= CATALOG_BROWSER_GRID_NARROW_MAX_WIDTH;

  if (variant === "inline") {
    return null;
  }

  return (
    <View style={styles.dockRoot}>
      {canShowAddToCart ? (
        <View style={styles.cartSlot}>
          <AddToCartButton productId={productId} product={product} variant="detailDock" />
        </View>
      ) : null}
      <View style={[styles.shortcutsRow, isNarrowDock && styles.shortcutsRowStacked]}>
        <Pressable
          style={[
            styles.shortcut,
            isNarrowDock && styles.shortcutFullWidth,
            !auctionActive && styles.shortcutInactive,
          ]}
          onPress={onAuctionPress}
          disabled={!auctionActive}
        >
          <AppText style={[styles.shortcutText, !auctionActive && styles.shortcutTextInactive]}>
            {PRODUCT_PRICE_OFFER_UI.AUCTION_SHORTCUT}
          </AppText>
        </Pressable>
        <Pressable
          style={[
            styles.shortcut,
            isNarrowDock && styles.shortcutFullWidth,
            !installmentActive && styles.shortcutInactive,
          ]}
          onPress={onInstallmentPress}
          disabled={!installmentActive}
        >
          <AppText
            style={[styles.shortcutText, !installmentActive && styles.shortcutTextInactive]}
          >
            {INSTALLMENT_UI.SHORTCUT}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
};
