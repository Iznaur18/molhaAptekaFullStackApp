import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { getCartLineStockHint } from "@/entities/cart/lib/getCartLineStockHint";
import { useCartActions } from "@/entities/cart/model/useCartActions";
import { ProductPriceDisplay } from "@/entities/product/ui/ProductPriceDisplay";
import { resolveProductImageUrl } from "@/entities/product/lib/resolveProductImageUrl";
import { getProductPurchaseLimit } from "@/entities/product/lib/getProductPurchaseLimit";
import { CART_PAGE_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
import { useCartLineItemStyles } from "@/shared/theme/commerceScreenStyles";
import { CachedProductImage } from "@/shared/ui/CachedProductImage";

import type { CartLine } from "../lib/selectCartLines";

type CartLineItemProps = {
  line: CartLine;
};

export const CartLineItem = ({ line }: CartLineItemProps) => {
  const router = useRouter();
  const styles = useCartLineItemStyles();
  const { setItemQuantity, removeItem, isUpdating } = useCartActions();

  const product = line.product;
  const name = product?.productName?.trim() || "—";
  const imageUrl = resolveProductImageUrl(product);
  const purchaseLimit = getProductPurchaseLimit(product);
  const stockHint = getCartLineStockHint(purchaseLimit, line.quantity);

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
    <View style={[styles.row, { backgroundColor: "#ffffff" }, isUpdating && styles.rowUpdating]}>
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
          {product ? <ProductPriceDisplay product={product} variant="cart" /> : null}
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
          <Feather name="trash-2" size={20} color={styles.removeIcon.color} />
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
    </View>
  );
};
