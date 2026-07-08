import { semanticColors } from "@/shared/theme/semanticColors";
import {
  ORDER_PAYMENT_METHOD_CARD_PREPAID,
  ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY,
  type OrderPaymentMethod,
} from "@/entities/order/model/constants";

export const CHECKOUT_PAYMENT_METHOD_CARD_LAYOUT = {
  width: 148,
  minHeight: 84,
  borderRadius: 16,
  gap: 12,
  selectedBorderWidth: 2,
  unselectedBorderWidth: 1,
} as const;

type PaymentMethodCardTheme = {
  surface: string;
  label: string;
};

export const CHECKOUT_PAYMENT_METHOD_CARD_THEME: Record<
  OrderPaymentMethod,
  PaymentMethodCardTheme
> = {
  [ORDER_PAYMENT_METHOD_CARD_PREPAID]: {
    surface: semanticColors.actionSoft,
    label: semanticColors.action,
  },
  [ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY]: {
    surface: semanticColors.successSurface,
    label: semanticColors.successText,
  },
};
