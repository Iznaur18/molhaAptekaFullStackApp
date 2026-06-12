import { useMutation } from "@tanstack/react-query";

import { createOrder, type CreateOrderPayload } from "../api/createOrder";

export const useCreateOrderMutation = () => {
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => createOrder(payload),
  });
};
