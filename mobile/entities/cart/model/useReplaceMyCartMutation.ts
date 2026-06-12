import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cartQueryKeys } from "@/shared/api";

import { replaceMyCart } from "../api/replaceMyCart";
import type { CartItemsByProductId } from "./types";

export const useReplaceMyCartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: replaceMyCart,
    onMutate: async (nextItems: CartItemsByProductId) => {
      await queryClient.cancelQueries({ queryKey: cartQueryKeys.all });
      const previous = queryClient.getQueryData<CartItemsByProductId>(cartQueryKeys.all);
      queryClient.setQueryData(cartQueryKeys.all, nextItems);
      return { previous };
    },
    onError: (_error, _items, context) => {
      if (context?.previous) {
        queryClient.setQueryData(cartQueryKeys.all, context.previous);
      }
    },
    onSuccess: (items) => {
      queryClient.setQueryData(cartQueryKeys.all, items);
    },
  });
};
