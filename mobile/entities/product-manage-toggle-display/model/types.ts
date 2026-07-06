import type { ProductManageToggleKey } from "@izibuy/shared-lib";

export type ProductManageToggleDisplayFromApi = {
  toggleKey: ProductManageToggleKey;
  imageUrl: string | null;
  updatedAt?: string | null;
};
