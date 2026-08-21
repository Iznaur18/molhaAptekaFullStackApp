import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { getCartLineStockHint } from "@/entities/cart/lib/getCartLineStockHint";
import { useCartActions } from "@/entities/cart/model/useCartActions";
import { resolveProductImageUrl } from "@/entities/product/lib/resolveProductImageUrl";
import { getProductPurchaseLimit } from "@/entities/product/lib/getProductPurchaseLimit";
import {
  CART_LINE_CARD_BORDER_RADIUS,
  CART_PAGE_UI,
  PRODUCT_BUY_N_FREE_UI,
  PRODUCT_PROMO_CODE_UI,
} from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useCartLineItemStyles } from "@/shared/theme/commerceScreenStyles";
import { AppCheckbox } from "@/shared/ui/AppCheckbox";
import { CachedProductImage } from "@/shared/ui/CachedProductImage";
import { SquircleView } from "@/shared/ui/SquircleView";

import type { CartLine } from "../lib/selectCartLines";

type CartLineItemProps = {
  line: CartLine;
  selected: boolean;
  onToggleSelected: (productId: string) => void;
};

export const CartLineItem = ({ line, selected, onToggleSelected }: CartLineItemProps) => {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useCartLineItemStyles();
  const { setItemQuantity, removeItem, isUpdating } = useCartActions();

  const product = line.product;
  const name = product?.productName?.trim() || "—";
  const imageUrl = resolveProductImageUrl(product);
  const purchaseLimit = getProductPurchaseLimit(product);
  const stockHint = getCartLineStockHint(purchaseLimit, line.quantity);
  const retailPrice = Math.floor(Number(product?.productPrice)) || 0;
  const unitPrice = Math.floor(Number(line.unitPrice)) || 0;
  const showRetailStrike =
    retailPrice > unitPrice &&
    (line.isPromoApplied === true || line.isWholesaleApplied === true);
  const unitPriceText = formatPriceRub(unitPrice);
  const buyNFreeUnits = Math.floor(Number(line.buyNFreeUnits) || 0);
  const paidQty = Math.max(0, line.quantity - buyNFreeUnits);
  const buyNFreeHint =
    buyNFreeUnits > 0
      ? PRODUCT_BUY_N_FREE_UI.CART_LINE_HINT(paidQty, unitPriceText)
      : null;

  const handleDecrease = () => {
    if (line.quantity <= 1) {
      void removeItem(line.productId);
      return;
    }
    void setItemQuantity(line.productId, line.quantity - 1);
  };

  const handleIncrease = () => {
    if (purchaseLimit > 0 && line.quantity >= purchaseLimit) {
      return;
    }
    void setItemQuantity(line.productId, line.quantity + 1);
  };

  const handleOpenProduct = () => {
    if (!product) {
      return;
    }
    router.push({ pathname: "/product/[id]", params: { id: line.productId } });
  };

  const increaseDisabled =
    isUpdating || (purchaseLimit > 0 && line.quantity >= purchaseLimit);

  return (
    <View style={[styles.rowOuter, isUpdating && styles.rowUpdating]}>
      <SquircleView radius={CART_LINE_CARD_BORDER_RADIUS} style={styles.row}>
        <View style={styles.mainRow}>
          <Pressable
            style={styles.imageWrap}
            onPress={handleOpenProduct}
            disabled={!product}
            accessibilityRole="button"
          >
            <CachedProductImage uri={imageUrl} style={styles.image} />
          </Pressable>

          <View style={styles.info}>
            <View style={styles.unitPriceRow}>
              <Text
                style={styles.unitPrice}
                numberOfLines={1}
                accessibilityLabel={`Цена ${formatPriceRub(unitPrice)}`}
              >
                {formatPriceRub(unitPrice)}
              </Text>
              {showRetailStrike ? (
                <Text style={styles.unitPriceOld} numberOfLines={1}>
                  {formatPriceRub(retailPrice)}
                </Text>
              ) : null}
            </View>
            {line.isWholesaleApplied ? (
              <Text style={styles.wholesaleBadge}>
                {CART_PAGE_UI.WHOLESALE_LINE_BADGE}
              </Text>
            ) : null}
            {line.isPromoApplied ? (
              <Text style={styles.wholesaleBadge}>
                {PRODUCT_PROMO_CODE_UI.CART_PROMO_LABEL}
                {line.promoDiscountPercent != null
                  ? ` ${PRODUCT_PROMO_CODE_UI.CART_PROMO_PERCENT(line.promoDiscountPercent)}`
                  : ""}
              </Text>
            ) : null}
            {buyNFreeHint ? (
              <Text style={styles.wholesaleBadge}>{buyNFreeHint}</Text>
            ) : null}
            {stockHint ? <Text style={styles.stockHint}>{stockHint}</Text> : null}
            {product ? (
              <Pressable onPress={handleOpenProduct}>
                <Text style={styles.nameLink} numberOfLines={3}>
                  {name}
                </Text>
              </Pressable>
            ) : (
              <Text style={styles.name} numberOfLines={3}>
                {name}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.actionRow}>
          <Pressable
            style={styles.removeButton}
            onPress={() => removeItem(line.productId)}
            disabled={isUpdating}
            accessibilityLabel={CART_PAGE_UI.REMOVE_LINE_ARIA}
          >
            <Feather name="trash-2" size={20} color={theme.colors.textMuted} />
          </Pressable>

          <View style={styles.stepperWrap}>
            <View style={styles.stepper}>
              <Pressable
                style={styles.stepButton}
                onPress={handleDecrease}
                disabled={isUpdating}
              >
                <Text style={styles.stepButtonText}>−</Text>
              </Pressable>
              <Text style={styles.quantity}>{line.quantity}</Text>
              <Pressable
                style={[styles.stepButton, increaseDisabled && styles.stepDisabled]}
                onPress={handleIncrease}
                disabled={increaseDisabled}
              >
                <Text style={styles.stepButtonText}>+</Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.lineTotal}>{formatPriceRub(line.lineTotal)}</Text>
        </View>
      </SquircleView>

      <AppCheckbox
        checked={selected}
        onPress={() => onToggleSelected(line.productId)}
        accessibilityLabel={CART_PAGE_UI.SELECT_LINE_ARIA}
        style={styles.selectCheckbox}
      />
    </View>
  );
};
