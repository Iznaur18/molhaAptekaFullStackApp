import type { OrderStatus } from "@/entities/order/model/constants";

/** Паритет с web `MySalesPage.css` status chip active colors. */
export const MY_SALES_STATUS_FILTER_CHIP_COLORS = {
  defaultActive: "#22c55e",
  pending: "#f59e0b",
  confirmed: "#1f6feb",
  shipped: "#6d28d9",
  delivered: "#22c55e",
  cancelled: "#dc2626",
} as const;

export const resolveMySalesStatusFilterChipActiveColors = (
  status: string,
): { backgroundColor: string; borderColor: string } => {
  if (!status) {
    return {
      backgroundColor: MY_SALES_STATUS_FILTER_CHIP_COLORS.defaultActive,
      borderColor: MY_SALES_STATUS_FILTER_CHIP_COLORS.defaultActive,
    };
  }

  const key = status as OrderStatus;
  const color =
    MY_SALES_STATUS_FILTER_CHIP_COLORS[key] ??
    MY_SALES_STATUS_FILTER_CHIP_COLORS.defaultActive;

  return { backgroundColor: color, borderColor: color };
};
