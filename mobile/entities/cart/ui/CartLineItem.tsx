import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { useCartActions } from "@/entities/cart/model/useCartActions";
import type { CartLineExclusionReason } from "@/entities/cart/lib/getCartLineExclusionReason";
import { resolveProductImageUrl } from "@/entities/product/lib/resolveProductImageUrl";
import { getProductPurchaseLimit } from "@/entities/product/lib/getProductPurchaseLimit";
import { CART_PAGE_UI, PRODUCT_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
import { useCartLineItemStyles } from "@/shared/theme/commerceScreenStyles";
import { CachedProductImage } from "@/shared/ui/CachedProductImage";

import type { CartLine } from "../lib/selectCartLines";

type CartLineItemProps = {
  line: CartLine;
  exclusionReason?: CartLineExclusionReason | null;
};

const EXCLUSION_COPY: Record<CartLineExclusionReason, string> = {
  missing: CART_PAGE_UI.PRODUCT_DELETED_OR_HIDDEN,
  unavailable: PRODUCT_UI.UNAVAILABLE,
  own_product: CART_PAGE_UI.LINE_OWN_PRODUCT,
};

export const CartLineItem = ({ line, exclusionReason = null }: CartLineItemProps) => {
  const router = useRouter();
  const styles = useCartLineItemStyles();
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
    isUpdating ||
    Boolean(exclusionReason) ||
    (purchaseLimit > 0 && line.quantity >= purchaseLimit);

  const exclusionLabel = exclusionReason ? EXCLUSION_COPY[exclusionReason] : null;

  return (
    <View style={[styles.row, isUpdating && styles.rowUpdating, exclusionReason && styles.rowExcluded]}>
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

        {exclusionLabel ? (
          <Text style={styles.excluded}>{exclusionLabel}</Text>
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
