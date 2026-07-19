import { useMutation } from "@tanstack/react-query";

import {
  createProductCategoryAdmin,
  deleteProductCategoryAdmin,
  patchProductCategoryAdmin,
} from "@/entities/product-category-tree/api/categoryAdminMutationsApi";
import type { ProductCategoryAdminWritePayload } from "@/entities/product-category-tree/model/adminTypes";

export const useProductCategoryAdminMutations = () => {
  const createMutation = useMutation({
    mutationFn: (payload: ProductCategoryAdminWritePayload) => createProductCategoryAdmin(payload),
  });

  const patchMutation = useMutation({
    mutationFn: ({
      categoryId,
      body,
    }: {
      categoryId: string;
      body: Partial<ProductCategoryAdminWritePayload>;
    }) => patchProductCategoryAdmin(categoryId, body),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ categoryId }: { categoryId: string }) => deleteProductCategoryAdmin(categoryId),
  });

  return { createMutation, patchMutation, deleteMutation };
};
