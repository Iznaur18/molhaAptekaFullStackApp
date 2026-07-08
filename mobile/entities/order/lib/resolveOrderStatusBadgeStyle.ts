import type { TextStyle, ViewStyle } from "react-native";

import {
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_PENDING,
  ORDER_STATUS_SHIPPED,
  type OrderStatus,
} from "@/entities/order/model/constants";
import { semanticColors } from "@/shared/theme/semanticColors";

/** Паритет с web `OrderCard.css` status / type badges. */
const ORDER_STATUS_BADGE_PALETTE = {
  default: {
    backgroundColor: semanticColors.border,
    color: semanticColors.text,
  },
  [ORDER_STATUS_PENDING]: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    color: semanticColors.warningText,
  },
  [ORDER_STATUS_CONFIRMED]: {
    backgroundColor: "rgba(31, 111, 235, 0.12)",
    color: semanticColors.action,
  },
  [ORDER_STATUS_SHIPPED]: {
    backgroundColor: "rgba(124, 58, 237, 0.12)",
    color: semanticColors.accent,
  },
  [ORDER_STATUS_DELIVERED]: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    color: semanticColors.successText,
  },
  [ORDER_STATUS_CANCELLED]: {
    backgroundColor: "rgba(180, 35, 24, 0.12)",
    color: semanticColors.danger,
  },
} as const;

export const ORDER_INSTALLMENT_BADGE_PALETTE = {
  backgroundColor: "rgba(59, 130, 246, 0.12)",
  color: semanticColors.actionHover,
} as const;

export const ORDER_AUCTION_BADGE_PALETTE = {
  backgroundColor: semanticColors.infoSoft,
  borderColor: "rgba(59, 130, 246, 0.4)",
  color: semanticColors.link,
} as const;

export const resolveOrderStatusBadgeStyle = (
  status?: string,
): Pick<ViewStyle & TextStyle, "backgroundColor" | "color"> => {
  if (!status) {
    return ORDER_STATUS_BADGE_PALETTE.default;
  }

  return (
    ORDER_STATUS_BADGE_PALETTE[status as OrderStatus] ?? ORDER_STATUS_BADGE_PALETTE.default
  );
};
