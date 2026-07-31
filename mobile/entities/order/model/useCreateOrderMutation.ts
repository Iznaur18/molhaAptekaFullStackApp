import { useMutation } from "@tanstack/react-query";

import { createClientIdempotencyKey } from "@/shared/lib/createClientIdempotencyKey";
import { readPersistedAffiliateCode } from "@/shared/lib/affiliateCodeStorage";

import { createOrder, type CreateOrderPayload } from "../api/createOrder";

export const useCreateOrderMutation = () => {
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
  });
};
