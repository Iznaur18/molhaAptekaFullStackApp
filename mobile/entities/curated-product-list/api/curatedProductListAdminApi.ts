import { apiClient } from "@/shared/api";
import { POPULAR_PRODUCTS_ADMIN_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type CuratedListAdminRow = {
  _id: string;
  title: string;
  productIds: string[];
  sortOrder?: number;
  updatedAt?: string | null;
};

export const fetchCuratedProductListsAdmin = async () => {
  try {
    const { data } = await apiClient.get("/product/admin/curated-lists");
    if (!data?.success || !Array.isArray(data.data?.lists)) {
      throw new Error(POPULAR_PRODUCTS_ADMIN_PAGE_UI.LOAD_ERROR);
    }
    return data.data.lists as CuratedListAdminRow[];
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, POPULAR_PRODUCTS_ADMIN_PAGE_UI.LOAD_ERROR));
  }
};
