import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { useCartActions } from "@/entities/cart/model/useCartActions";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { useMyCartQuery } from "@/entities/cart/model/useMyCartQuery";
import { getProductPurchaseLimit } from "@/entities/product/lib/getProductPurchaseLimit";
import { ADD_TO_CART_UI } from "@/shared/config";
import { FIXED_FONT_PROPS } from "@/shared/lib/fixedTypography";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useAddToCartButtonStyles } from "@/shared/theme/uploadFieldStyles";

type AddToCartButtonProps = {
  productId: string;
  product?: unknown;
  variant?: "default" | "detailDock";
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
    void setItemQuantity(productId, purchaseLimit);
  }, [hasStockLimit, productId, purchaseLimit, quantity, setItemQuantity]);

  const handleLogin = () => {
    router.push("/(auth)/login");
  };

  if (!isAuthorized) {
    return (
      <Pressable
        style={isDetailDock ? styles.detailDockLoginButton : styles.loginButton}
        onPress={handleLogin}
      >
        <Text
          style={isDetailDock ? styles.detailDockLoginButtonText : styles.loginButtonText}
          {...fixedFontProps}
        >
          {ADD_TO_CART_UI.LOGIN_TO_ADD}
        </Text>
      </Pressable>
    );
  }

  if (quantity === 0) {
    const outOfStock = hasStockLimit && purchaseLimit < 1;

    return (
      <Pressable
        style={[
          isDetailDock ? styles.detailDockAddButton : styles.addButton,
          (outOfStock || isUpdating) && styles.buttonDisabled,
        ]}
        onPress={() => addItem(productId, 1)}
        disabled={outOfStock || isUpdating}
      >
        {isUpdating ? (
          <ActivityIndicator color={theme.colors.onContrast} />
        ) : (
          <Text
            style={isDetailDock ? styles.detailDockAddButtonText : styles.addButtonText}
            {...fixedFontProps}
          >
            {ADD_TO_CART_UI.ADD}
          </Text>
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
  const stepperStyle = isDetailDock ? styles.detailDockStepper : styles.stepper;
  const stepButtonStyle = isDetailDock ? styles.detailDockStepButton : styles.stepButton;
  const stepButtonTextStyle = isDetailDock ? styles.detailDockStepButtonText : styles.stepButtonText;
  const quantityStyle = isDetailDock ? styles.detailDockQuantity : styles.quantity;

  return (
    <View style={stepperStyle}>
      <Pressable
        style={stepButtonStyle}
        onPress={handleDecrease}
        disabled={isUpdating}
        accessibilityLabel={ADD_TO_CART_UI.DECREASE_ARIA}
      >
        <Text style={stepButtonTextStyle} {...fixedFontProps}>
          −
        </Text>
      </Pressable>
      <Text
        style={quantityStyle}
        accessibilityLabel={ADD_TO_CART_UI.QUANTITY_ARIA}
        {...fixedFontProps}
      >
        {quantity}
      </Text>
      <Pressable
        style={[stepButtonStyle, increaseDisabled && styles.buttonDisabled]}
        onPress={handleIncrease}
        disabled={increaseDisabled}
        accessibilityLabel={ADD_TO_CART_UI.INCREASE_ARIA}
      >
        <Text style={stepButtonTextStyle} {...fixedFontProps}>
          +
        </Text>
      </Pressable>
    </View>
  );
};
