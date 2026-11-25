import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";

import { useCartActions } from "@/entities/cart/model/useCartActions";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { useMyCartQuery } from "@/entities/cart/model/useMyCartQuery";
import { getProductCartQuantityLimit } from "@/entities/product/lib/getProductPurchaseLimit";
import { resolveProductPurchaseBlockState } from "@/entities/product/lib/resolveProductPurchaseBlockState";
import { resolveProductSellerClosedPurchaseState } from "@/entities/product/lib/resolveProductSellerClosedPurchaseState";
import { ADD_TO_CART_BUTTON_LAYOUT } from "@/entities/product/lib/addToCartButtonLayout";
import { ADD_TO_CART_UI } from "@/shared/config";
import { BlockedPurchaseButton } from "@/shared/ui/BlockedPurchaseButton";
import { FIXED_FONT_PROPS } from "@/shared/lib/fixedTypography";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import {
  PRODUCT_DETAIL_DOCK_CTA_BORDER_RADIUS,
  useAddToCartButtonStyles,
} from "@/shared/theme/uploadFieldStyles";
import { ShoppingCart } from "@/shared/ui/productDetailsLucideIcons";
import { PressableScale } from "@/shared/ui/PressableScale";
import { SquircleView } from "@/shared/ui/SquircleView";

type AddToCartButtonProps = {
  productId: string;
  product?: unknown;
  /**
   * `card` — карточка главной: компактная, гость «В корзину» (текст+a11y).
   * `banner` — баннер ленты: ширина надписи + тележка, гость «В корзину».
   * `detailDock` / default — гость «Войти, чтобы купить» (= web detail).
   */
  variant?: "default" | "detailDock" | "card" | "banner";
};

const showCartError = (error: unknown) => {
  const message =
    error instanceof Error && error.message ? error.message : ADD_TO_CART_UI.ADD_FAILED;
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
  const isCard = variant === "card";
  const isBanner = variant === "banner";
  const blockedVariant = isDetailDock
    ? "detailDock"
    : isCard
      ? "card"
      : isBanner
        ? "banner"
        : "default";
  const fixedFontProps = isDetailDock ? FIXED_FONT_PROPS : {};

  const quantity = cartQuery.data?.[productId] ?? 0;
  const purchaseLimit = getProductCartQuantityLimit(product);
  const hasStockLimit = purchaseLimit > 0;
  const { isPurchaseBlocked, blockedLabel } = resolveProductPurchaseBlockState(
    product as Record<string, unknown> | null | undefined,
  );
  const { isSellerClosed, closedLabel: sellerClosedLabel } =
    resolveProductSellerClosedPurchaseState(
      product as Record<string, unknown> | null | undefined,
    );

  useEffect(() => {
    if (!hasStockLimit || quantity <= purchaseLimit) {
      return;
    }
    void setItemQuantity(productId, purchaseLimit).catch(showCartError);
  }, [hasStockLimit, productId, purchaseLimit, quantity, setItemQuantity]);

  if (isPurchaseBlocked) {
    return <BlockedPurchaseButton label={blockedLabel} variant={blockedVariant} />;
  }

  if (isSellerClosed) {
    return <BlockedPurchaseButton label={sellerClosedLabel} variant={blockedVariant} />;
  }

  const handleLogin = () => {
    router.push("/(auth)/login");
  };

  const handleAdd = () => {
    void addItem(productId, 1).catch(showCartError);
  };

  const handleDecrease = () => {
    const run =
      quantity <= 1 ? removeItem(productId) : setItemQuantity(productId, quantity - 1);
    void run.catch(showCartError);
  };

  const handleIncrease = () => {
    if (hasStockLimit && quantity >= purchaseLimit) {
      return;
    }
    void setItemQuantity(productId, quantity + 1).catch(showCartError);
  };

  const renderBannerButton = (
    onPress: () => void,
    {
      disabled = false,
      accessibilityLabel = ADD_TO_CART_UI.ADD,
    }: { disabled?: boolean; accessibilityLabel?: string } = {},
  ) => (
    <PressableScale
      style={styles.bannerPressable}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <View style={[styles.bannerButton, disabled && styles.buttonDisabled]}>
        {isUpdating ? (
          <ActivityIndicator color={theme.colors.onContrast} />
        ) : (
          <>
            <ShoppingCart size={16} color={theme.colors.onContrast} strokeWidth={2} />
            <Text style={styles.bannerButtonText}>{ADD_TO_CART_UI.ADD}</Text>
          </>
        )}
      </View>
    </PressableScale>
  );

  if (!isAuthorized) {
    // Карточка/баннер главной: как web `guestLabel={ADD}` — видимый текст и a11y
    // «В корзину», тап → login. Dock/default: «Войти, чтобы купить» (= web detail).
    if (isBanner) {
      return renderBannerButton(handleLogin, {
        accessibilityLabel: ADD_TO_CART_UI.ADD,
      });
    }

    if (isDetailDock) {
      return (
        <PressableScale
          style={styles.detailDockPressable}
          onPress={handleLogin}
          accessibilityRole="button"
          accessibilityLabel={ADD_TO_CART_UI.LOGIN_TO_ADD}
        >
          <SquircleView
            radius={PRODUCT_DETAIL_DOCK_CTA_BORDER_RADIUS}
            style={styles.detailDockLoginButton}
          >
            <Text style={styles.detailDockLoginButtonText} {...fixedFontProps}>
              {ADD_TO_CART_UI.LOGIN_TO_ADD}
            </Text>
          </SquircleView>
        </PressableScale>
      );
    }

    if (isCard) {
      return (
        <PressableScale
          style={styles.addButtonPressable}
          onPress={handleLogin}
          accessibilityRole="button"
          accessibilityLabel={ADD_TO_CART_UI.ADD}
        >
          <SquircleView
            radius={ADD_TO_CART_BUTTON_LAYOUT.borderRadius}
            style={[styles.addButton, styles.cardButton]}
          >
            <Text style={[styles.addButtonText, styles.cardButtonText]}>
              {ADD_TO_CART_UI.ADD}
            </Text>
          </SquircleView>
        </PressableScale>
      );
    }

    return (
      <PressableScale
        style={styles.loginButtonPressable}
        onPress={handleLogin}
        accessibilityRole="button"
        accessibilityLabel={ADD_TO_CART_UI.LOGIN_TO_ADD}
      >
        <SquircleView
          radius={ADD_TO_CART_BUTTON_LAYOUT.borderRadius}
          style={styles.loginButton}
        >
          <Text style={styles.loginButtonText} {...fixedFontProps}>
            {ADD_TO_CART_UI.LOGIN_TO_ADD}
          </Text>
        </SquircleView>
      </PressableScale>
    );
  }

  if (quantity === 0) {
    const outOfStock = hasStockLimit && purchaseLimit < 1;
    const disabled = outOfStock || isUpdating;

    if (isBanner) {
      return renderBannerButton(handleAdd, { disabled });
    }

    if (isDetailDock) {
      return (
        <PressableScale
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
        </PressableScale>
      );
    }

    return (
      <PressableScale
        style={styles.addButtonPressable}
        onPress={handleAdd}
        disabled={disabled}
      >
        <SquircleView
          radius={ADD_TO_CART_BUTTON_LAYOUT.borderRadius}
          style={[
            styles.addButton,
            isCard && styles.cardButton,
            disabled && styles.buttonDisabled,
          ]}
        >
          {isUpdating ? (
            <ActivityIndicator color={theme.colors.onContrast} />
          ) : (
            <Text
              style={[styles.addButtonText, isCard && styles.cardButtonText]}
              {...fixedFontProps}
            >
              {ADD_TO_CART_UI.ADD}
            </Text>
          )}
        </SquircleView>
      </PressableScale>
    );
  }

  if (isDetailDock) {
    return (
      <PressableScale
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
      </PressableScale>
    );
  }

  const increaseDisabled = isUpdating || (hasStockLimit && quantity >= purchaseLimit);

  return (
    <View
      style={[
        styles.stepper,
        isCard && styles.cardStepper,
        isBanner && styles.bannerStepper,
      ]}
    >
      <PressableScale
        style={styles.stepButton}
        onPress={handleDecrease}
        disabled={isUpdating}
        accessibilityLabel={ADD_TO_CART_UI.DECREASE_ARIA}
      >
        <Text style={[styles.stepButtonText, isBanner && styles.bannerStepButtonText]}>
          −
        </Text>
      </PressableScale>
      <Text style={styles.quantity} accessibilityLabel={ADD_TO_CART_UI.QUANTITY_ARIA}>
        {quantity}
      </Text>
      <PressableScale
        style={[styles.stepButton, increaseDisabled && styles.buttonDisabled]}
        onPress={handleIncrease}
        disabled={increaseDisabled}
        accessibilityLabel={ADD_TO_CART_UI.INCREASE_ARIA}
      >
        <Text style={[styles.stepButtonText, isBanner && styles.bannerStepButtonText]}>
          +
        </Text>
      </PressableScale>
    </View>
  );
};
