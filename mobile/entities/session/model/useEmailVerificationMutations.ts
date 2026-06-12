import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authMeQueryKeys } from "@/shared/api";

import { fetchAuthMe } from "../api/fetchAuthMe";
import { resendEmailVerification } from "../api/resendEmailVerification";
import { verifyEmailWithCode } from "../api/verifyEmailWithCode";

export const useEmailVerificationMutations = () => {
  const queryClient = useQueryClient();

  const verifyMutation = useMutation({
    mutationFn: verifyEmailWithCode,
    onSuccess: async () => {
      const me = await fetchAuthMe();
      queryClient.setQueryData(authMeQueryKeys.all, me);
    },
  });

  const resendMutation = useMutation({
    mutationFn: resendEmailVerification,
  });

  return { verifyMutation, resendMutation };
};
