import { useMutation, useQueryClient } from "@tanstack/react-query";

import { convertPartnerBalance } from "../api/referralProgram.js";
import { invalidateLoyaltyPointsStatus } from "../lib/loyaltyPointsQueryCache.js";
import { MY_REFERRAL_PROGRAM_QUERY_KEY } from "./useMyReferralProgramQuery.js";

export function useConvertPartnerBalanceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ amount, idempotencyKey }) =>
      convertPartnerBalance(amount, idempotencyKey),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MY_REFERRAL_PROGRAM_QUERY_KEY });
      void invalidateLoyaltyPointsStatus(queryClient);
    },
  });
}
