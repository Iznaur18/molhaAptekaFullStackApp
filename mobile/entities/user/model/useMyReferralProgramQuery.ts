import { useQuery } from "@tanstack/react-query";

import { fetchMyReferralProgram } from "@/entities/user/api/referralProgram";

export const MY_REFERRAL_PROGRAM_QUERY_KEY = ["user", "me", "referral"] as const;

export function useMyReferralProgramQuery(enabled = true) {
  return useQuery({
    queryKey: MY_REFERRAL_PROGRAM_QUERY_KEY,
    queryFn: fetchMyReferralProgram,
    enabled,
  });
}
