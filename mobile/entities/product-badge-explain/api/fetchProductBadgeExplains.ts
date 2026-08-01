import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

import type { ProductBadgeExplainFromApi } from "../model/types";

export const fetchProductBadgeExplains = async (): Promise<
  ProductBadgeExplainFromApi[]
> => {
  try {
    const { data } = await apiClient.get("/product/badge-explains");
    if (!data?.success || !Array.isArray(data.data?.displays)) {
      throw new Error(API_CLIENT_UI.FETCH_BADGE_EXPLAINS_FALLBACK);
    }
    return data.data.displays as ProductBadgeExplainFromApi[];
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.FETCH_BADGE_EXPLAINS_FALLBACK),
    );
  }
};
