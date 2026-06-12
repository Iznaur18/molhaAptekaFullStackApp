import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { useCartActions } from "@/entities/cart/model/useCartActions";
import { useIsAuthorized } from "@/entities/cart/model/useIsAuthorized";
import { useMyCartQuery } from "@/entities/cart/model/useMyCartQuery";
import { getProductPurchaseLimit } from "@/entities/product/lib/getProductPurchaseLimit";
import { ADD_TO_CART_UI } from "@/shared/config";

type AddToCartButtonProps = {
  productId: string;
  product?: unknown;
};

export const AddToCartButton = ({ productId, product }: AddToCartButtonProps) => {
  const router = useRouter();
  const isAuthorized = useIsAuthorized();
  const cartQuery = useMyCartQuery();
  const { addItem, setItemQuantity, removeItem, isUpdating } = useCartActions();

  const quantity = cartQuery.data?.[productId] ?? 0;
  const purchaseLimit = getProductPurchaseLimit(product);
  const hasStockLimit = purchaseLimit > 0;

  useEffect(() => {
    if (!hasStockLimit || quantity <= purchaseLimit) {
      return;
    }
    void setItemQuantity(productId, purchaseLimit);
  }, [hasStockLimit, productId, purchaseLimit, quantity, setItemQuantity]);

  const handleLogin = () => {
    router.push("/(auth)/login");
  };

  if (!isAuthorized) {
    return (
      <Pressable style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>{ADD_TO_CART_UI.LOGIN_TO_ADD}</Text>
      </Pressable>
    );
  }

  if (quantity === 0) {
    const outOfStock = hasStockLimit && purchaseLimit < 1;

    return (
      <Pressable
        style={[styles.addButton, (outOfStock || isUpdating) && styles.buttonDisabled]}
        onPress={() => addItem(productId, 1)}
        disabled={outOfStock || isUpdating}
      >
        {isUpdating ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.addButtonText}>{ADD_TO_CART_UI.ADD}</Text>
        )}
      </Pressable>
    );
  }

  const handleDecrease = () => {
    if (quantity <= 1) {
      void removeItem(productId);
      return;
    }
    void setItemQuantity(productId, quantity - 1);
  };

  const handleIncrease = () => {
    if (hasStockLimit && quantity >= purchaseLimit) {
      return;
    }
    void setItemQuantity(productId, quantity + 1);
  };

  const increaseDisabled = isUpdating || (hasStockLimit && quantity >= purchaseLimit);

  return (
    <View style={styles.stepper}>
      <Pressable
        style={styles.stepButton}
        onPress={handleDecrease}
        disabled={isUpdating}
        accessibilityLabel={ADD_TO_CART_UI.DECREASE_ARIA}
      >
        <Text style={styles.stepButtonText}>−</Text>
      </Pressable>
      <Text style={styles.quantity} accessibilityLabel={ADD_TO_CART_UI.QUANTITY_ARIA}>
        {quantity}
      </Text>
      <Pressable
        style={[styles.stepButton, increaseDisabled && styles.buttonDisabled]}
        onPress={handleIncrease}
        disabled={increaseDisabled}
        accessibilityLabel={ADD_TO_CART_UI.INCREASE_ARIA}
      >
        <Text style={styles.stepButtonText}>+</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  addButton: {
    marginTop: 16,
    backgroundColor: "#111",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loginButton: {
    marginTop: 16,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#111",
  },
  loginButtonText: {
    color: "#111",
    fontSize: 16,
    fontWeight: "600",
  },
  stepper: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 12,
  },
  stepButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  stepButtonText: {
    fontSize: 20,
    fontWeight: "600",
  },
  quantity: {
    fontSize: 18,
    fontWeight: "600",
    minWidth: 24,
    textAlign: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
