export type ProductManageToggleRowVariant =
  | "default"
  | "auction"
  | "installment"
  | "raffle"
  | "danger";

type ToggleRowStyles = {
  rowDefaultChecked: object;
  rowRaffle: object;
  rowRaffleChecked: object;
  rowAuction: object;
  rowAuctionChecked: object;
  rowInstallment: object;
  rowInstallmentChecked: object;
  rowDanger: object;
};

export const resolveProductManageToggleRowVisualStyles = (
  styles: ToggleRowStyles,
  variant: ProductManageToggleRowVariant,
  checked: boolean,
): object[] => {
  if (variant === "danger") {
    return [styles.rowDanger];
  }

  if (variant === "auction") {
    return checked
      ? [styles.rowAuction, styles.rowAuctionChecked]
      : [styles.rowAuction];
  }

  if (variant === "installment") {
    return checked
      ? [styles.rowInstallment, styles.rowInstallmentChecked]
      : [styles.rowInstallment];
  }

  if (variant === "raffle") {
    return checked
      ? [styles.rowRaffle, styles.rowRaffleChecked]
      : [styles.rowRaffle];
  }

  return checked ? [styles.rowDefaultChecked] : [];
};
