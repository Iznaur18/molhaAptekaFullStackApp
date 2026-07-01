import { useMutation } from "@tanstack/react-query";

import {
  createProductCategoryAdmin,
  deleteProductCategoryAdmin,
  patchProductCategoryAdmin,
} from "@/entities/product-category-tree/api/categoryAdminMutationsApi";
import type { ProductCategoryAdminWritePayload } from "@/entities/product-category-tree/model/adminTypes";
import type { DeleteProductCategoryOptions } from "@/entities/product-category-tree/api/categoryAdminMutationsApi";

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
    mutationFn: ({
      categoryId,
      options,
    }: {
      categoryId: string;
      options?: DeleteProductCategoryOptions;
    }) => deleteProductCategoryAdmin(categoryId, options),
  });

  return { createMutation, patchMutation, deleteMutation };
};
