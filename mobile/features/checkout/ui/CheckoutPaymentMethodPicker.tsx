import { Pressable, ScrollView, Text, View } from "react-native";

import {
  ORDER_PAYMENT_METHOD_LABEL_RU,
  ORDER_PAYMENT_METHODS,
  type OrderPaymentMethod,
} from "@/entities/order/model/constants";
import {
  CHECKOUT_PAYMENT_METHOD_CARD_LAYOUT,
  CHECKOUT_PAYMENT_METHOD_CARD_THEME,
} from "@/entities/order/lib/checkoutPaymentMethodCardTheme";
import { CHECKOUT_FORM_UI } from "@/shared/config";
import { useCheckoutPaymentMethodPickerStyles } from "@/shared/theme/formChromeStyles";

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
  const styles = useCheckoutPaymentMethodPickerStyles();

  return (
    <View style={styles.root}>
      <Text style={styles.legend}>{CHECKOUT_FORM_UI.LABEL_PAYMENT_METHOD}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {ORDER_PAYMENT_METHODS.map((method) => {
          const isSelected = value === method;
          const cardTheme = CHECKOUT_PAYMENT_METHOD_CARD_THEME[method];

          return (
            <Pressable
              key={method}
              style={[
                styles.card,
                isSelected
                  ? styles.cardSelected
                  : {
                      backgroundColor: cardTheme.surface,
                      borderColor: cardTheme.surface,
                    },
              ]}
              onPress={() => onChange(method)}
              disabled={disabled}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected, disabled }}
              accessibilityLabel={ORDER_PAYMENT_METHOD_LABEL_RU[method]}
            >
              <Text
                style={[
                  styles.cardLabel,
                  isSelected ? styles.cardLabelSelected : { color: cardTheme.label },
                ]}
              >
                {ORDER_PAYMENT_METHOD_LABEL_RU[method]}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};
