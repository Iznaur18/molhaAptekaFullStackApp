import { mapCategoryDisplaysById } from "@/entities/product-category-display/lib/mapCategoryDisplaysById";
import type { ProductCategoryDisplayFromApi } from "@/entities/product-category-display/lib/resolveProductCategoryDisplay";

export type ResolvedProductCategoryNodeDisplay = {
  categoryId: string;
  label: string;
  fallbackLabel: string;
  imageUrl: string | null;
  isCustomLabel: boolean;
  isCustomImage: boolean;
};

export const resolveProductCategoryNodeDisplay = (
  categoryId: string,
  fallbackLabel: string,
  displays: ProductCategoryDisplayFromApi[],
): ResolvedProductCategoryNodeDisplay => {
  const override = mapCategoryDisplaysById(displays).get(categoryId);
  const customLabel =
    typeof override?.customLabel === "string" && override.customLabel.trim()
      ? override.customLabel.trim()
      : null;
  const customImage =
    typeof override?.imageUrl === "string" && override.imageUrl.trim()
      ? override.imageUrl.trim()
      : null;

  return {
    categoryId,
    label: customLabel ?? fallbackLabel,
    fallbackLabel,
    imageUrl: customImage,
    isCustomLabel: customLabel != null,
    isCustomImage: customImage != null,
  };
};
