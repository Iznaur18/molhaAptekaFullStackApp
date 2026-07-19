import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createProductCategoryAdmin } from "../api/createProductCategoryAdmin.js";
import { deleteProductCategoryAdmin } from "../api/deleteProductCategoryAdmin.js";
import { patchProductCategoryAdmin } from "../api/patchProductCategoryAdmin.js";
import { productCategoryDisplayQueryKeys } from "../../product-category-display/model/productCategoryDisplayQueryKeys.js";
import { productCategoryTreeQueryKeys } from "./productCategoryTreeQueryKeys.js";

export function useProductCategoryAdminMutations() {
  const queryClient = useQueryClient();

  const invalidateCatalogCategorySurfaces = () => {
    void queryClient.invalidateQueries({ queryKey: productCategoryTreeQueryKeys.roots() });
    void queryClient.invalidateQueries({
      queryKey: productCategoryDisplayQueryKeys.categories(),
    });
  };

  const createMutation = useMutation({
    mutationFn: createProductCategoryAdmin,
    onSuccess: invalidateCatalogCategorySurfaces,
  });

  const patchMutation = useMutation({
    mutationFn: ({ categoryId, body }) => patchProductCategoryAdmin(categoryId, body),
    onSuccess: invalidateCatalogCategorySurfaces,
  });

  const deleteMutation = useMutation({
    mutationFn: ({ categoryId }) => deleteProductCategoryAdmin(categoryId),
    onSuccess: invalidateCatalogCategorySurfaces,
  });

  return {
    createMutation,
    patchMutation,
    deleteMutation,
  };
}
