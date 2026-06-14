import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

import type { ProductCategoryDisplayFromApi } from "../lib/resolveProductCategoryDisplay";

type PatchCategoryDisplayBody = {
  customLabel?: string | null;
  imageUrl?: string | null;
  resetCustomLabel?: boolean;
  resetImageUrl?: boolean;
};

export const patchProductCategoryDisplay = async (
  categorySlug: string,
  body: PatchCategoryDisplayBody,
): Promise<ProductCategoryDisplayFromApi> => {
  try {
    const { data } = await apiClient.patch(
      `/product/category-displays/${encodeURIComponent(categorySlug)}`,
      body,
    );
    if (!data?.success || !data.data?.display) {
      throw new Error(API_CLIENT_UI.PATCH_CATEGORY_DISPLAY_FALLBACK);
    }
    return data.data.display as ProductCategoryDisplayFromApi;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.PATCH_CATEGORY_DISPLAY_FALLBACK));
  }
};
