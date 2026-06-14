import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createProductCategoryAdmin,
  deleteProductCategoryAdmin,
  patchProductCategoryAdmin,
} from "@/entities/product-category-tree/api/categoryAdminMutationsApi";
import { categoryAdminQueryKeys } from "@/shared/api";

import type { ProductCategoryAdminWritePayload } from "./adminTypes";
import type { DeleteProductCategoryOptions } from "../api/categoryAdminMutationsApi";

export const useProductCategoryAdminMutations = () => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: categoryAdminQueryKeys.all });
  };

  const createMutation = useMutation({
    mutationFn: (payload: ProductCategoryAdminWritePayload) => createProductCategoryAdmin(payload),
    onSuccess: invalidate,
  });

  const patchMutation = useMutation({
    mutationFn: ({
      categoryId,
      body,
    }: {
      categoryId: string;
      body: Partial<ProductCategoryAdminWritePayload>;
    }) => patchProductCategoryAdmin(categoryId, body),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: ({
      categoryId,
      options,
    }: {
      categoryId: string;
      options?: DeleteProductCategoryOptions;
    }) => deleteProductCategoryAdmin(categoryId, options),
    onSuccess: invalidate,
  });

  return { createMutation, patchMutation, deleteMutation };
};
