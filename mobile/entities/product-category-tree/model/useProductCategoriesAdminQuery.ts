import { useQuery } from "@tanstack/react-query";

import { fetchProductCategoriesAdmin } from "@/entities/product-category-tree/api/categoryAdminApi";
import { categoryAdminQueryKeys } from "@/shared/api";

export const useProductCategoriesAdminQuery = (enabled = true) =>
  useQuery({
    queryKey: categoryAdminQueryKeys.all,
    queryFn: fetchProductCategoriesAdmin,
    enabled,
  });
