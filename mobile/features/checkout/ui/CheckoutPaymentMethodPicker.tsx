import { Pressable, Text, View } from "react-native";

import {
  ORDER_PAYMENT_METHOD_LABEL_RU,
  ORDER_PAYMENT_METHODS,
  ORDER_PAYMENT_METHODS_SELECTABLE,
  type OrderPaymentMethod,
} from "@/entities/order/model/constants";
import { CHECKOUT_PAYMENT_METHOD_CARD_THEME } from "@/entities/order/lib/checkoutPaymentMethodCardTheme";
import { CHECKOUT_FORM_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useCheckoutPaymentMethodPickerStyles } from "@/shared/theme/formChromeStyles";

const SELECTABLE_SET = new Set<OrderPaymentMethod>(ORDER_PAYMENT_METHODS_SELECTABLE);

type CheckoutPaymentMethodPickerProps = {
  value: OrderPaymentMethod;
  onChange: (method: OrderPaymentMethod) => void;
  disabled?: boolean;
};

export const CheckoutPaymentMethodPicker = ({
  value,
  onChange,
  disabled = false,
}: CheckoutPaymentMethodPickerProps) => {
  const theme = useAppTheme();
  const styles = useCheckoutPaymentMethodPickerStyles();

  return (
    <View style={styles.root}>
      <Text style={styles.legend}>{CHECKOUT_FORM_UI.LABEL_PAYMENT_METHOD}</Text>
      <View style={styles.row} accessibilityRole="radiogroup">
        {ORDER_PAYMENT_METHODS.map((method) => {
          const isSelectable = SELECTABLE_SET.has(method);
          const isSelected = value === method;
          const isLocked = !isSelectable;
          const cardTheme = CHECKOUT_PAYMENT_METHOD_CARD_THEME[method];
          const isInactive = disabled || isLocked;

          return (
            <Pressable
              key={method}
              style={[
                styles.card,
                isLocked
                  ? {
                      backgroundColor: theme.colors.surfaceMuted,
                      borderColor: theme.colors.border,
                      opacity: 1,
                    }
                  : isSelected
                    ? styles.cardSelected
                    : {
                        backgroundColor: cardTheme.surface,
                        borderColor: cardTheme.surface,
                      },
              ]}
              onPress={() => {
                if (!isSelectable) {
                  return;
                }
                onChange(method);
              }}
              disabled={isInactive}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected, disabled: isInactive }}
              accessibilityLabel={
                isLocked
                  ? `${ORDER_PAYMENT_METHOD_LABEL_RU[method]} (${CHECKOUT_FORM_UI.PAYMENT_METHOD_CARD_SOON})`
                  : ORDER_PAYMENT_METHOD_LABEL_RU[method]
              }
            >
              <Text
                style={[
                  styles.cardLabel,
                  isLocked
                    ? { color: theme.colors.textMuted }
                    : isSelected
                      ? styles.cardLabelSelected
                      : { color: cardTheme.label },
                ]}
              >
                {ORDER_PAYMENT_METHOD_LABEL_RU[method]}
                {isLocked
                  ? ` (${CHECKOUT_FORM_UI.PAYMENT_METHOD_CARD_SOON})`
                  : ""}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
