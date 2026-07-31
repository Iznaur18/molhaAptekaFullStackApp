import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createClientIdempotencyKey } from "../../../shared/lib/createClientIdempotencyKey.js";
import { createOrder } from "../api/createOrder.js";
import { invalidateOrderQueries } from "../lib/orderQueryCache.js";

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) =>
      createOrder({
        ...payload,
        idempotencyKey: payload.idempotencyKey ?? createClientIdempotencyKey(),
      }),
    onSuccess: () => {
      void invalidateOrderQueries(queryClient);
    },
  });
}
