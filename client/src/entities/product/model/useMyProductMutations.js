import { useMutation } from "@tanstack/react-query";

import { createProduct } from "../api/createProduct.js";
import { deleteMyProduct } from "../api/deleteMyProduct.js";
import { patchMyProduct } from "../api/patchMyProduct.js";

export function useMyProductMutations() {
  const patchMutation = useMutation({
    mutationFn: ({ productId, body }) => patchMyProduct(productId, body),
  });

  const deleteMutation = useMutation({
    mutationFn: (productId) => deleteMyProduct(productId),
  });

  const createMutation = useMutation({
    mutationFn: createProduct,
  });

  return {
    patchMutation,
    deleteMutation,
    createMutation,
  };
}
