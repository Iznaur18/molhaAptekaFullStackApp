import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

import type { ProductManageToggleDisplayFromApi } from "../model/types";

type PatchProductManageToggleDisplayBody = {
  imageUrl?: string | null;
  resetImageUrl?: boolean;
};

export const patchProductManageToggleDisplay = async (
  toggleKey: string,
  body: PatchProductManageToggleDisplayBody,
): Promise<{ display: ProductManageToggleDisplayFromApi }> => {
  try {
    const { data } = await apiClient.patch(
      `/product/manage-toggle-displays/${encodeURIComponent(toggleKey)}`,
      body,
    );
    if (!data?.success || !data.data?.display) {
      throw new Error(API_CLIENT_UI.PATCH_MANAGE_TOGGLE_DISPLAY_FALLBACK);
    }
    return { display: data.data.display as ProductManageToggleDisplayFromApi };
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.PATCH_MANAGE_TOGGLE_DISPLAY_FALLBACK),
    );
  }
};
