import { Pressable, Text, View } from "react-native";
import { resolveCheckoutPaymentMethodOptions } from "@izibuy/shared-lib";

import {
  ORDER_PAYMENT_METHOD_LABEL_RU,
  type OrderPaymentMethod,
} from "@/entities/order/model/constants";
import { CHECKOUT_PAYMENT_METHOD_CARD_THEME } from "@/entities/order/lib/checkoutPaymentMethodCardTheme";
import { CHECKOUT_FORM_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useCheckoutPaymentMethodPickerStyles } from "@/shared/theme/formChromeStyles";

type CheckoutPaymentMethodPickerProps = {
  value: OrderPaymentMethod;
  onChange: (method: OrderPaymentMethod) => void;
  disabled?: boolean;
  /** Продавцы корзины входят в список предоплаты площадки — СБП доступна. */
  cardPrepaidAvailable?: boolean;
  /** Что принимают продавцы корзины; `null` — ограничений нет. */
  allowedMethods?: readonly string[] | null;
  hiddenMethods?: readonly string[];
  /** Подпись блока; по умолчанию «Способ оплаты». */
  legend?: string;
};

export const CheckoutPaymentMethodPicker = ({
  value,
  onChange,
  disabled = false,
  cardPrepaidAvailable = false,
  allowedMethods = null,
  hiddenMethods = [],
  legend = CHECKOUT_FORM_UI.LABEL_PAYMENT_METHOD,
}: CheckoutPaymentMethodPickerProps) => {
  const theme = useAppTheme();
  const styles = useCheckoutPaymentMethodPickerStyles();
  // Что доступно, в каком порядке и почему недоступно — считает shared-lib,
  // одинаково для сайта и приложения.
  const { orderedMethods, availableMethods, notAcceptedBySeller } =
    resolveCheckoutPaymentMethodOptions({
      cardPrepaidAvailable,
      allowedMethods,
      hiddenMethods,
    });

  // Выбирать не из чего — одна строка вместо ряда, где половина карточек
  // бледные «не принимает». Сам способ форма выставляет сама.
  if (availableMethods.length === 1) {
    return (
      <View style={styles.root}>
        <Text style={styles.legend}>{legend}</Text>
        <Text style={styles.single} accessibilityRole="text">
          {ORDER_PAYMENT_METHOD_LABEL_RU[availableMethods[0]]}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Text style={styles.legend}>{legend}</Text>
      <View style={styles.row} accessibilityRole="radiogroup">
        {orderedMethods.map((method) => {
          const isSelectable = availableMethods.includes(method);
          const isSelected = value === method;
          const isLocked = !isSelectable;
          const cardTheme = CHECKOUT_PAYMENT_METHOD_CARD_THEME[method];
          const isInactive = disabled || isLocked;
          // «Скоро» и «продавец не принимает» — разные вещи: первое обещает,
          // что способ вот-вот появится, а у этого продавца он не появится.
          const lockReason = notAcceptedBySeller.includes(method)
            ? CHECKOUT_FORM_UI.PAYMENT_METHOD_NOT_ACCEPTED
            : CHECKOUT_FORM_UI.PAYMENT_METHOD_CARD_SOON;

          return (
            <Pressable
              key={method}
              style={[
                styles.card,
                isLocked
                  ? styles.cardLocked
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
                  ? `${ORDER_PAYMENT_METHOD_LABEL_RU[method]} (${lockReason})`
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
              </Text>
              {isLocked ? (
                <Text style={styles.cardLockReason}>{lockReason}</Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
