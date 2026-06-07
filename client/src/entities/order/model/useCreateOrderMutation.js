import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createOrder } from "../api/createOrder.js";
import { invalidateOrderQueries } from "../lib/orderQueryCache.js";

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      void invalidateOrderQueries(queryClient);
    },
  });
}
