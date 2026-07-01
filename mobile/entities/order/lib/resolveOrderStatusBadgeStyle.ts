import type { TextStyle, ViewStyle } from "react-native";

import {
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_PENDING,
  ORDER_STATUS_SHIPPED,
  type OrderStatus,
} from "@/entities/order/model/constants";

/** Паритет с web `OrderCard.css` status / type badges. */
const ORDER_STATUS_BADGE_PALETTE = {
  default: {
    backgroundColor: "#e5e7eb",
    color: "#111827",
  },
  [ORDER_STATUS_PENDING]: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    color: "#92400e",
  },
  [ORDER_STATUS_CONFIRMED]: {
    backgroundColor: "rgba(31, 111, 235, 0.12)",
    color: "#1f6feb",
  },
  [ORDER_STATUS_SHIPPED]: {
    backgroundColor: "rgba(124, 58, 237, 0.12)",
    color: "#6d28d9",
  },
  [ORDER_STATUS_DELIVERED]: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    color: "#047857",
  },
  [ORDER_STATUS_CANCELLED]: {
    backgroundColor: "rgba(180, 35, 24, 0.12)",
    color: "#b42318",
  },
} as const;

export const ORDER_INSTALLMENT_BADGE_PALETTE = {
  backgroundColor: "rgba(59, 130, 246, 0.12)",
  color: "#1d4ed8",
} as const;

export const ORDER_AUCTION_BADGE_PALETTE = {
  backgroundColor: "#e0f2fe",
  borderColor: "rgba(59, 130, 246, 0.4)",
  color: "#2563eb",
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
