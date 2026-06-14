import { useMutation, useQueryClient } from "@tanstack/react-query";

import { catalogQueryKeys, myProductsQueryKeys } from "@/shared/api";

import { deleteMyProduct } from "../api/deleteMyProduct";
import { patchMyProduct, type PatchMyProductBody } from "../api/patchMyProduct";

export const useMyProductMutations = () => {
  const queryClient = useQueryClient();

  const invalidateProducts = (productId?: string) => {
    void queryClient.invalidateQueries({ queryKey: myProductsQueryKeys.all });
    if (productId) {
      void queryClient.invalidateQueries({
        queryKey: catalogQueryKeys.product(productId),
      });
    }
  };

  const patchMutation = useMutation({
    mutationFn: ({ productId, body }: { productId: string; body: PatchMyProductBody }) =>
      patchMyProduct(productId, body),
    onSuccess: (_product, variables) => invalidateProducts(variables.productId),
  });

  const deleteMutation = useMutation({
    mutationFn: (productId: string) => deleteMyProduct(productId),
    onSuccess: (_result, productId) => invalidateProducts(productId),
  });

  return {
    patchMutation,
    deleteMutation,
  };
};
