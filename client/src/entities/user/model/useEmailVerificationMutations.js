import { useMutation } from "@tanstack/react-query";

import { resendEmailVerification } from "../api/resendEmailVerification.js";
import { verifyEmailWithCode } from "../api/verifyEmailWithCode.js";

export function useEmailVerificationMutations() {
  const verifyMutation = useMutation({
    mutationFn: (code) => verifyEmailWithCode(code),
  });

  const resendMutation = useMutation({
    mutationFn: () => resendEmailVerification(),
  });

  return {
    verifyMutation,
    resendMutation,
  };
}
