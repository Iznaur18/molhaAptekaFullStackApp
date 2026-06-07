import { useMutation, useQueryClient } from "@tanstack/react-query";

import { replaceMyCart } from "../api/replaceMyCart.js";
import { cartQueryKeys } from "./cartQueryKeys.js";

export function useReplaceMyCartMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: replaceMyCart,
    onSuccess: (saved) => {
      queryClient.setQueryData(cartQueryKeys.my(), saved);
    },
  });
}
