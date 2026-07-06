import type { ProductCategoryDisplayFromApi } from "./resolveProductCategoryDisplay";
import type { ResolvedProductCategoryDisplay } from "./resolveProductCategoryDisplay";
import { patchProductCategoryDisplay } from "../api/patchProductCategoryDisplay";
import { patchProductCategoryNodeDisplay } from "../api/patchProductCategoryNodeDisplay";

export type PatchCategoryDisplayBody = {
  customLabel?: string | null;
  imageUrl?: string | null;
  resetCustomLabel?: boolean;
  resetImageUrl?: boolean;
};

export const patchResolvedProductCategoryDisplay = async (
  resolved: Pick<ResolvedProductCategoryDisplay, "categoryId" | "displaySlug">,
  body: PatchCategoryDisplayBody,
): Promise<ProductCategoryDisplayFromApi> => {
  if (resolved.categoryId) {
    return patchProductCategoryNodeDisplay(resolved.categoryId, body);
  }

  return patchProductCategoryDisplay(resolved.displaySlug, body);
};
