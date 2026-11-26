import { semanticColors } from "@/shared/theme/semanticColors";
import {
  ORDER_PAYMENT_METHOD_CARD_ON_DELIVERY,
  ORDER_PAYMENT_METHOD_CARD_PREPAID,
  ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY,
  type OrderPaymentMethod,
} from "@/entities/order/model/constants";

/** Паритет web `CheckoutPaymentMethodPicker.css` (live ≤640). */
export const CHECKOUT_PAYMENT_METHOD_CARD_LAYOUT = {
  minHeight: 52,
  minWidth: 136,
  maxWidth: 184,
  borderRadius: 12,
  gap: 8,
  paddingVertical: 8,
  paddingHorizontal: 12,
  selectedBorderWidth: 2,
  unselectedBorderWidth: 1.5,
} as const;

type PaymentMethodCardTheme = {
  surface: string;
  label: string;
};

/** Невыбранные кнопки — серые; цвет метода не красит фон. */
export const CHECKOUT_PAYMENT_METHOD_CARD_THEME: Record<
  OrderPaymentMethod,
  PaymentMethodCardTheme
> = {
  [ORDER_PAYMENT_METHOD_CARD_PREPAID]: {
    surface: semanticColors.surfaceMuted,
    label: semanticColors.text,
  },
  [ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY]: {
    surface: semanticColors.surfaceMuted,
    label: semanticColors.text,
  },
  [ORDER_PAYMENT_METHOD_CARD_ON_DELIVERY]: {
    surface: semanticColors.surfaceMuted,
    label: semanticColors.text,
  },
};
