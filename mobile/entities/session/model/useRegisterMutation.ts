import { useMutation } from "@tanstack/react-query";

import { registerUser, type RegisterPayload } from "../api/registerUser";

export const useRegisterMutation = () =>
  useMutation({
    mutationFn: (payload: RegisterPayload) => registerUser(payload),
  });
