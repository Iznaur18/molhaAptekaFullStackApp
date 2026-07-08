import { semanticColors } from "@/shared/theme/semanticColors";


export const resolveInstallmentStatusFilterChipActiveColors = (
  status: string,
): { backgroundColor: string; borderColor: string } => {
  if (!status) {
    return { backgroundColor: semanticColors.action, borderColor: semanticColors.action };
  }
  if (status === "in_progress") {
    return { backgroundColor: semanticColors.success, borderColor: semanticColors.success };
  }
  if (status === "completed") {
    return { backgroundColor: semanticColors.success, borderColor: semanticColors.success };
  }
  if (status === "defaulted") {
    return { backgroundColor: semanticColors.warning, borderColor: semanticColors.warning };
  }
  if (status === "cancelled") {
    return { backgroundColor: semanticColors.danger, borderColor: semanticColors.danger };
  }
  return { backgroundColor: semanticColors.action, borderColor: semanticColors.action };
};
