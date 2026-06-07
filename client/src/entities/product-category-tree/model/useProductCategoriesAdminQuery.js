import { useQuery } from "@tanstack/react-query";

import { fetchProductCategoriesAdmin } from "../api/fetchProductCategoriesAdmin.js";
import { productCategoryAdminQueryKeys } from "./productCategoryAdminQueryKeys.js";

/**
 * @param {{ enabled?: boolean }} [params]
 */
export function useProductCategoriesAdminQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: productCategoryAdminQueryKeys.all,
    enabled,
    queryFn: fetchProductCategoriesAdmin,
  });
}
