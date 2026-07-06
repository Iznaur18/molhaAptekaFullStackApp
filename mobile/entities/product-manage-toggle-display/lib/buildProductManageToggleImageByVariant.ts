import { PRODUCT_MANAGE_TOGGLE_VARIANT_BY_KEY } from "@izibuy/shared-lib";

import type { ProductManageToggleDisplayFromApi } from "../model/types";
import type { ProductManageToggleRowVariant } from "@/entities/product/lib/resolveProductManageToggleRowVisualStyles";

export const buildProductManageToggleImageByVariant = (
  displays: ProductManageToggleDisplayFromApi[],
): Partial<Record<ProductManageToggleRowVariant, string | null>> => {
  const byKey = new Map(displays.map((row) => [row.toggleKey, row.imageUrl]));

  return Object.entries(PRODUCT_MANAGE_TOGGLE_VARIANT_BY_KEY).reduce<
    Partial<Record<ProductManageToggleRowVariant, string | null>>
  >((acc, [toggleKey, variant]) => {
    acc[variant] = byKey.get(toggleKey as keyof typeof PRODUCT_MANAGE_TOGGLE_VARIANT_BY_KEY) ?? null;
    return acc;
  }, {});
};
