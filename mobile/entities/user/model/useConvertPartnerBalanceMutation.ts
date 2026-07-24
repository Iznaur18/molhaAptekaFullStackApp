import { useMutation, useQueryClient } from "@tanstack/react-query";

import { convertPartnerBalance } from "@/entities/user/api/referralProgram";
import { MY_REFERRAL_PROGRAM_QUERY_KEY } from "@/entities/user/model/useMyReferralProgramQuery";
import { loyaltyPointsQueryKeys } from "@/shared/api";

export function useConvertPartnerBalanceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      amount,
      idempotencyKey,
    }: {
      amount: number;
      idempotencyKey?: string;
    }) => convertPartnerBalance(amount, idempotencyKey),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MY_REFERRAL_PROGRAM_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: loyaltyPointsQueryKeys.all });
    },
  });
}
