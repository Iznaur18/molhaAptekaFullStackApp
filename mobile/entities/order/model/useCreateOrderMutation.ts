import { useMutation } from "@tanstack/react-query";

import { createClientIdempotencyKey } from "@/shared/lib/createClientIdempotencyKey";

import { createOrder, type CreateOrderPayload } from "../api/createOrder";

export const useCreateOrderMutation = () => {
  return useMutation({
    mutationFn: (payload: Omit<CreateOrderPayload, "idempotencyKey"> & {
      idempotencyKey?: string;
    }) =>
      createOrder({
        ...payload,
        idempotencyKey: payload.idempotencyKey ?? createClientIdempotencyKey(),
      }),
  });
};
