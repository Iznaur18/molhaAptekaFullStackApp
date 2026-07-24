import { useQuery } from "@tanstack/react-query";

import { fetchMyReferralProgram } from "../api/referralProgram.js";

export const MY_REFERRAL_PROGRAM_QUERY_KEY = ["user", "me", "referral"];

/**
 * @param {{ enabled?: boolean }} [options]
 */
export function useMyReferralProgramQuery(options = {}) {
  const { enabled = true } = options;
  return useQuery({
    queryKey: MY_REFERRAL_PROGRAM_QUERY_KEY,
    queryFn: fetchMyReferralProgram,
    enabled,
  });
}
