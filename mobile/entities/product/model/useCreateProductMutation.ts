import { useMutation, useQueryClient } from "@tanstack/react-query";

import { myProductsQueryKeys } from "@/shared/api";

import { createProduct, type CreateProductBody } from "../api/createProduct";

export const useCreateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateProductBody) => createProduct(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: myProductsQueryKeys.all });
    },
  });
};
