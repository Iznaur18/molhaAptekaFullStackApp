import type { OrderStatus } from "@/entities/order/model/constants";

/** Паритет с web `MyOrdersPage.css` status chip active colors. */
export const MY_ORDERS_STATUS_FILTER_CHIP_COLORS = {
  defaultActive: "#1f6feb",
  pending: "#f59e0b",
  confirmed: "#1f6feb",
  shipped: "#6d28d9",
  delivered: "#22c55e",
  cancelled: "#dc2626",
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
