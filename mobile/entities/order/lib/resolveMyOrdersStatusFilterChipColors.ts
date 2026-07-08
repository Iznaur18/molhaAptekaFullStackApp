import type { OrderStatus } from "@/entities/order/model/constants";
import { semanticColors } from "@/shared/theme/semanticColors";

/** Паритет с web `MyOrdersPage.css` status chip active colors. */
export const MY_ORDERS_STATUS_FILTER_CHIP_COLORS = {
  defaultActive: semanticColors.action,
  pending: semanticColors.warning,
  confirmed: semanticColors.action,
  shipped: semanticColors.accent,
  delivered: semanticColors.success,
  cancelled: semanticColors.danger,
} as const;

export const resolveMyOrdersStatusFilterChipActiveColors = (
  status: string,
): { backgroundColor: string; borderColor: string } => {
  if (!status) {
    return {
      backgroundColor: MY_ORDERS_STATUS_FILTER_CHIP_COLORS.defaultActive,
      borderColor: MY_ORDERS_STATUS_FILTER_CHIP_COLORS.defaultActive,
    };
  }

  const key = status as OrderStatus;
  const color =
    MY_ORDERS_STATUS_FILTER_CHIP_COLORS[key] ??
    MY_ORDERS_STATUS_FILTER_CHIP_COLORS.defaultActive;

  return { backgroundColor: color, borderColor: color };
};
