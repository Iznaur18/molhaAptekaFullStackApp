import { Pressable, View } from "react-native";

import { AddToCartButton } from "@/features/cart-add/ui/AddToCartButton";
import { INSTALLMENT_UI, PRODUCT_PRICE_OFFER_UI } from "@/shared/config";
import {
  PRODUCT_DETAIL_SHORTCUT_BORDER_RADIUS,
  useProductDetailPurchaseActionsStyles,
} from "@/shared/theme/catalogProductStyles";
import { AppText } from "@/shared/ui/AppText";
import { SquircleView } from "@/shared/ui/SquircleView";

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
      <View style={styles.shortcutsRow}>
        <Pressable
          style={styles.shortcutPressable}
          onPress={onAuctionPress}
          disabled={!auctionActive}
        >
          <SquircleView
            radius={PRODUCT_DETAIL_SHORTCUT_BORDER_RADIUS}
            style={[styles.shortcut, !auctionActive && styles.shortcutInactive]}
          >
            <AppText style={[styles.shortcutText, !auctionActive && styles.shortcutTextInactive]}>
              {PRODUCT_PRICE_OFFER_UI.AUCTION_SHORTCUT}
            </AppText>
          </SquircleView>
        </Pressable>
        <Pressable
          style={styles.shortcutPressable}
          onPress={onInstallmentPress}
          disabled={!installmentActive}
        >
          <SquircleView
            radius={PRODUCT_DETAIL_SHORTCUT_BORDER_RADIUS}
            style={[styles.shortcut, !installmentActive && styles.shortcutInactive]}
          >
            <AppText
              style={[styles.shortcutText, !installmentActive && styles.shortcutTextInactive]}
            >
              {INSTALLMENT_UI.SHORTCUT}
            </AppText>
          </SquircleView>
        </Pressable>
      </View>
    </View>
  );
};
