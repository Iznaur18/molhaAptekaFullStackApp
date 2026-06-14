import { apiClient } from "@/shared/api";
import { CATEGORY_TREE_ADMIN_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

import type { ProductCategoryAdminRow } from "../model/adminTypes";

export const fetchProductCategoriesAdmin = async (): Promise<ProductCategoryAdminRow[]> => {
  try {
    const { data } = await apiClient.get("/product/admin/categories");
    if (!data?.success || !Array.isArray(data.data?.categories)) {
      throw new Error(CATEGORY_TREE_ADMIN_PAGE_UI.LOAD_ERROR);
    }
    return data.data.categories as ProductCategoryAdminRow[];
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, CATEGORY_TREE_ADMIN_PAGE_UI.LOAD_ERROR));
  }
};
