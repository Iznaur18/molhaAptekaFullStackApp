import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useCartActions } from "@/entities/cart/model/useCartActions";
import { resolveProductImageUrl } from "@/entities/product/lib/resolveProductImageUrl";
import { getProductPurchaseLimit } from "@/entities/product/lib/getProductPurchaseLimit";
import { CART_PAGE_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
import { CachedProductImage } from "@/shared/ui/CachedProductImage";

import type { CartLine } from "../lib/selectCartLines";

type CartLineItemProps = {
  line: CartLine;
};

export const CartLineItem = ({ line }: CartLineItemProps) => {
  const router = useRouter();
  const { setItemQuantity, removeItem, isUpdating } = useCartActions();

  const product = line.product;
  const name = product?.productName?.trim() || "—";
  const imageUrl = resolveProductImageUrl(product);
  const purchaseLimit = getProductPurchaseLimit(product);

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
    <View style={[styles.row, isUpdating && styles.rowUpdating]}>
      <View style={styles.imageWrap}>
        <CachedProductImage uri={imageUrl} style={styles.image} />
      </View>

      <View style={styles.info}>
        {product ? (
          <Pressable onPress={handleOpenProduct}>
            <Text style={styles.name} numberOfLines={2}>
              {name}
            </Text>
          </Pressable>
        ) : (
          <Text style={styles.name} numberOfLines={2}>
            {name}
          </Text>
        )}

        {line.isMissing ? (
          <Text style={styles.missing}>{CART_PAGE_UI.PRODUCT_DELETED_OR_HIDDEN}</Text>
        ) : (
          <Text style={styles.unitPrice}>{formatPriceRub(product?.productPrice)}</Text>
        )}

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

      <View style={styles.actions}>
        <Text style={styles.lineTotal}>{formatPriceRub(line.lineTotal)}</Text>
        <Pressable
          onPress={() => removeItem(line.productId)}
          disabled={isUpdating}
          accessibilityLabel={CART_PAGE_UI.REMOVE_LINE_ARIA}
        >
          <Text style={styles.remove}>✕</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e5e5",
    gap: 12,
  },
  rowUpdating: {
    opacity: 0.7,
  },
  imageWrap: {
    width: 72,
    height: 72,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f4f4f4",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
  unitPrice: {
    marginTop: 4,
    fontSize: 13,
    color: "#666",
  },
  missing: {
    marginTop: 4,
    fontSize: 12,
    color: "#c62828",
  },
  stepper: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  stepDisabled: {
    opacity: 0.4,
  },
  stepButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  quantity: {
    fontSize: 15,
    fontWeight: "600",
    minWidth: 20,
    textAlign: "center",
  },
  actions: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  lineTotal: {
    fontSize: 15,
    fontWeight: "700",
  },
  remove: {
    fontSize: 18,
    color: "#999",
    padding: 4,
  },
});
