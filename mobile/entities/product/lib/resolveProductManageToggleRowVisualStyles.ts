export type ProductManageToggleRowVariant =
  | "default"
  | "auction"
  | "installment"
  | "raffle"
  | "danger";

type ToggleRowStyles = {
  rowDanger: object;
};

export const resolveProductManageToggleRowVisualStyles = (
  styles: ToggleRowStyles,
  variant: ProductManageToggleRowVariant,
): object[] => (variant === "danger" ? [styles.rowDanger] : []);
