import { semanticColors } from "@/shared/theme/semanticColors";

/** Паритет с web `MySalesPage.css` status chip active colors. */
export const MY_SALES_STATUS_FILTER_CHIP_COLORS = {
  defaultActive: semanticColors.success,
  pending: semanticColors.warning,
  confirmed: semanticColors.action,
  shipped: semanticColors.accent,
  delivered: semanticColors.success,
  cancelled: semanticColors.danger,
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

  // Свой цвет на сайте есть только у пяти исходных статусов, остальные — общий.
  const key = status as keyof typeof MY_SALES_STATUS_FILTER_CHIP_COLORS;
  const color =
    MY_SALES_STATUS_FILTER_CHIP_COLORS[key] ??
    MY_SALES_STATUS_FILTER_CHIP_COLORS.defaultActive;

  return { backgroundColor: color, borderColor: color };
};
