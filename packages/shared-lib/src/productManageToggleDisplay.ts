export const PRODUCT_MANAGE_TOGGLE_KEY_VALUES = [
  "auction",
  "installment",
  "raffle",
  "visibility",
] as const;

export type ProductManageToggleKey = (typeof PRODUCT_MANAGE_TOGGLE_KEY_VALUES)[number];

export type ProductManageToggleRowVariant =
  | "default"
  | "auction"
  | "installment"
  | "raffle"
  | "danger";

export type ProductManageTogglePaletteEntry = {
  background: string;
  backgroundChecked: string;
  title: string;
  description: string;
};

export const PRODUCT_MANAGE_TOGGLE_PALETTE: Record<
  Exclude<ProductManageToggleRowVariant, "danger">,
  ProductManageTogglePaletteEntry
> = {
  auction: {
    background: "#FFD56B",
    backgroundChecked: "#FFC940",
    title: "#3D3D3D",
    description: "#5E5E5E",
  },
  installment: {
    background: "#B8F5C8",
    backgroundChecked: "#8EEDAB",
    title: "#1F4D32",
    description: "#3D6B4F",
  },
  raffle: {
    background: "#E8D4FF",
    backgroundChecked: "#D4B3FF",
    title: "#3D2E55",
    description: "#5E4D73",
  },
  default: {
    background: "#D4E8FF",
    backgroundChecked: "#B8D9FF",
    title: "#2E4055",
    description: "#4D6073",
  },
};

export const PRODUCT_MANAGE_TOGGLE_VARIANT_BY_KEY: Record<
  ProductManageToggleKey,
  Exclude<ProductManageToggleRowVariant, "danger">
> = {
  auction: "auction",
  installment: "installment",
  raffle: "raffle",
  visibility: "default",
};

export const resolveProductManageToggleKeyFromVariant = (
  variant: ProductManageToggleRowVariant,
): ProductManageToggleKey | null => {
  if (variant === "danger") {
    return null;
  }

  const entry = Object.entries(PRODUCT_MANAGE_TOGGLE_VARIANT_BY_KEY).find(
    ([, mappedVariant]) => mappedVariant === variant,
  );

  return entry ? (entry[0] as ProductManageToggleKey) : null;
};

export const resolveProductManageTogglePalette = (
  variant: ProductManageToggleRowVariant,
  checked: boolean,
): ProductManageTogglePaletteEntry | null => {
  if (variant === "danger") {
    return null;
  }

  const palette = PRODUCT_MANAGE_TOGGLE_PALETTE[variant];
  if (!palette) {
    return null;
  }

  return {
    ...palette,
    background: checked ? palette.backgroundChecked : palette.background,
  };
};
