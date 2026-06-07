import { useMutation } from "@tanstack/react-query";

import { createProductCategoryAdmin } from "../api/createProductCategoryAdmin.js";
import { deleteProductCategoryAdmin } from "../api/deleteProductCategoryAdmin.js";
import { patchProductCategoryAdmin } from "../api/patchProductCategoryAdmin.js";

export function useProductCategoryAdminMutations() {
  const createMutation = useMutation({
    mutationFn: createProductCategoryAdmin,
  });

  const patchMutation = useMutation({
    mutationFn: ({ categoryId, body }) => patchProductCategoryAdmin(categoryId, body),
  });

  const deleteMutation = useMutation({
    mutationFn: (categoryId) => deleteProductCategoryAdmin(categoryId),
  });

  return {
    createMutation,
    patchMutation,
    deleteMutation,
  };
}
