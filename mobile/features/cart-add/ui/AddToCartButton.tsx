import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";

import { useCartActions } from "@/entities/cart/model/useCartActions";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { useMyCartQuery } from "@/entities/cart/model/useMyCartQuery";
import { getProductPurchaseLimit } from "@/entities/product/lib/getProductPurchaseLimit";
import { ADD_TO_CART_BUTTON_LAYOUT } from "@/entities/product/lib/addToCartButtonLayout";
import { ADD_TO_CART_UI } from "@/shared/config";
import { FIXED_FONT_PROPS } from "@/shared/lib/fixedTypography";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import {
  PRODUCT_DETAIL_DOCK_CTA_BORDER_RADIUS,
  useAddToCartButtonStyles,
} from "@/shared/theme/uploadFieldStyles";
import { SquircleView } from "@/shared/ui/SquircleView";

type AddToCartButtonProps = {
  productId: string;
  product?: unknown;
  variant?: "default" | "detailDock";
};

const showCartError = (error: unknown) => {
  const message =
    error instanceof Error && error.message
      ? error.message
      : ADD_TO_CART_UI.ADD_FAILED;
  Alert.alert(ADD_TO_CART_UI.ADD_FAILED, message);
};

export const AddToCartButton = ({
  productId,
  product,
  variant = "default",
}: AddToCartButtonProps) => {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useAddToCartButtonStyles();
  const isAuthorized = useIsAuthorized();
  const cartQuery = useMyCartQuery();
  const { addItem, setItemQuantity, removeItem, isUpdating } = useCartActions();
  const isDetailDock = variant === "detailDock";
  const fixedFontProps = isDetailDock ? FIXED_FONT_PROPS : {};

  const quantity = cartQuery.data?.[productId] ?? 0;
  const purchaseLimit = getProductPurchaseLimit(product);
  const hasStockLimit = purchaseLimit > 0;

  useEffect(() => {
    if (!hasStockLimit || quantity <= purchaseLimit) {
      return;
    }
    void setItemQuantity(productId, purchaseLimit).catch(showCartError);
  }, [hasStockLimit, productId, purchaseLimit, quantity, setItemQuantity]);

  const handleLogin = () => {
    router.push("/(auth)/login");
  };

  const handleAdd = () => {
    void addItem(productId, 1).catch(showCartError);
  };

  const handleDecrease = () => {
    const run =
      quantity <= 1
        ? removeItem(productId)
        : setItemQuantity(productId, quantity - 1);
    void run.catch(showCartError);
  };

  const handleIncrease = () => {
    if (hasStockLimit && quantity >= purchaseLimit) {
      return;
    }
    void setItemQuantity(productId, quantity + 1).catch(showCartError);
  };

  if (!isAuthorized) {
    if (isDetailDock) {
      return (
        <Pressable style={styles.detailDockPressable} onPress={handleLogin}>
          <SquircleView
            radius={PRODUCT_DETAIL_DOCK_CTA_BORDER_RADIUS}
            style={styles.detailDockLoginButton}
          >
            <Text style={styles.detailDockLoginButtonText} {...fixedFontProps}>
              {ADD_TO_CART_UI.LOGIN_TO_ADD}
            </Text>
          </SquircleView>
        </Pressable>
      );
    }

    return (
      <Pressable style={styles.loginButtonPressable} onPress={handleLogin}>
        <SquircleView radius={ADD_TO_CART_BUTTON_LAYOUT.borderRadius} style={styles.loginButton}>
          <Text style={styles.loginButtonText} {...fixedFontProps}>
            {ADD_TO_CART_UI.LOGIN_TO_ADD}
          </Text>
        </SquircleView>
      </Pressable>
    );
  }

  if (quantity === 0) {
    const outOfStock = hasStockLimit && purchaseLimit < 1;
    const disabled = outOfStock || isUpdating;

    if (isDetailDock) {
      return (
        <Pressable
          style={styles.detailDockPressable}
          onPress={handleAdd}
          disabled={disabled}
        >
          <SquircleView
            radius={PRODUCT_DETAIL_DOCK_CTA_BORDER_RADIUS}
            style={[styles.detailDockAddButton, disabled && styles.buttonDisabled]}
          >
            {isUpdating ? (
              <ActivityIndicator color={theme.colors.onContrast} />
            ) : (
              <Text style={styles.detailDockAddButtonText} {...fixedFontProps}>
                {ADD_TO_CART_UI.ADD}
              </Text>
            )}
          </SquircleView>
        </Pressable>
      );
    }

    return (
      <Pressable
        style={styles.addButtonPressable}
        onPress={handleAdd}
        disabled={disabled}
      >
        <SquircleView
          radius={ADD_TO_CART_BUTTON_LAYOUT.borderRadius}
          style={[styles.addButton, disabled && styles.buttonDisabled]}
        >
          {isUpdating ? (
            <ActivityIndicator color={theme.colors.onContrast} />
          ) : (
            <Text style={styles.addButtonText} {...fixedFontProps}>
              {ADD_TO_CART_UI.ADD}
            </Text>
          )}
        </SquircleView>
      </Pressable>
    );
  }

  if (isDetailDock) {
    return (
      <Pressable
        style={styles.detailDockPressable}
        onPress={() => {
          router.push("/(tabs)/cart");
        }}
      >
        <SquircleView
          radius={PRODUCT_DETAIL_DOCK_CTA_BORDER_RADIUS}
          style={styles.detailDockGoToCartButton}
        >
          <Text style={styles.detailDockAddButtonText} {...fixedFontProps}>
            {ADD_TO_CART_UI.GO_TO_CART}
          </Text>
        </SquircleView>
      </Pressable>
    );
  }

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
