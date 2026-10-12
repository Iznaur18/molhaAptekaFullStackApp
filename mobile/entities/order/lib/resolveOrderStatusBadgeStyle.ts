import type { TextStyle, ViewStyle } from "react-native";

import {
  ORDER_STATUS_ACCEPTED,
  ORDER_STATUS_ASSEMBLING,
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_COURIER_ASSIGNED,
  ORDER_STATUS_COURIER_HOLDING,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_DISPUTED,
  ORDER_STATUS_IN_DELIVERY,
  ORDER_STATUS_PENDING,
  ORDER_STATUS_READY_FOR_PICKUP,
  ORDER_STATUS_READY_TO_SHIP,
  ORDER_STATUS_RETURNED,
  ORDER_STATUS_SHIPPED,
  type OrderStatus,
} from "@/entities/order/model/constants";
import { semanticColors } from "@/shared/theme/semanticColors";

type OrderStatusBadgeColors = { backgroundColor: string; color: string };

const ON_SOLID = "#ffffff";
const ON_PENDING = "#231500";

const solid = (backgroundColor: string, color = ON_SOLID): OrderStatusBadgeColors => ({
  backgroundColor,
  color,
});

/**
 * Паритет с web `OrderCard.css` (`.order-card__status_*`): сплошная заливка,
 * цвета одинаковые в обеих темах, текст белый (на жёлтом — тёмный).
 */
export const ORDER_STATUS_BADGE_PALETTE: Record<OrderStatus, OrderStatusBadgeColors> = {
  [ORDER_STATUS_PENDING]: solid("#f59e0b", ON_PENDING),
  [ORDER_STATUS_ACCEPTED]: solid("#0284c7"),
  [ORDER_STATUS_ASSEMBLING]: solid("#0284c7"),
  [ORDER_STATUS_READY_FOR_PICKUP]: solid("#ea580c"),
  [ORDER_STATUS_READY_TO_SHIP]: solid("#ea580c"),
  [ORDER_STATUS_SHIPPED]: solid("#7c3aed"),
  [ORDER_STATUS_COURIER_ASSIGNED]: solid("#7c3aed"),
  [ORDER_STATUS_COURIER_HOLDING]: solid("#7c3aed"),
  [ORDER_STATUS_IN_DELIVERY]: solid("#7c3aed"),
  [ORDER_STATUS_DELIVERED]: solid("#0d9488"),
  [ORDER_STATUS_CONFIRMED]: solid("#16a34a"),
  [ORDER_STATUS_CANCELLED]: solid("#dc2626"),
  [ORDER_STATUS_RETURNED]: solid("#64748b"),
  [ORDER_STATUS_DISPUTED]: solid("#be123c"),
};

/** Web: `--order-status-bg` по умолчанию. */
const ORDER_STATUS_BADGE_DEFAULT = solid("#475569");

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
    return ORDER_STATUS_BADGE_DEFAULT;
  }

  return (
    ORDER_STATUS_BADGE_PALETTE[status as OrderStatus] ?? ORDER_STATUS_BADGE_DEFAULT
  );
};
