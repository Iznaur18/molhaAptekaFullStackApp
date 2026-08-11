import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createClientIdempotencyKey } from "@/shared/lib/createClientIdempotencyKey";
import { readPersistedAffiliateCode } from "@/shared/lib/affiliateCodeStorage";

import { createOrder, type CreateOrderPayload } from "../api/createOrder";

const appliedMineKey = ["product-promo-code", "applied-mine"] as const;

export const useCreateOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: Omit<CreateOrderPayload, "idempotencyKey"> & {
        idempotencyKey?: string;
      },
    ) => {
      const affiliateCode =
        payload.affiliateCode ?? (await readPersistedAffiliateCode()) ?? "";
      return createOrder({
        ...payload,
        ...(affiliateCode ? { affiliateCode } : {}),
        idempotencyKey: payload.idempotencyKey ?? createClientIdempotencyKey(),
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: appliedMineKey });
      queryClient.removeQueries({ queryKey: appliedMineKey });
    },
  });
};
