import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

import type { ProductManageToggleDisplayFromApi } from "../model/types";

export const fetchProductManageToggleDisplays = async (): Promise<
  ProductManageToggleDisplayFromApi[]
> => {
  try {
    const { data } = await apiClient.get("/product/manage-toggle-displays");
    if (!data?.success || !Array.isArray(data.data?.displays)) {
      throw new Error(API_CLIENT_UI.FETCH_MANAGE_TOGGLE_DISPLAYS_FALLBACK);
    }
    return data.data.displays as ProductManageToggleDisplayFromApi[];
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.FETCH_MANAGE_TOGGLE_DISPLAYS_FALLBACK),
    );
  }
};
