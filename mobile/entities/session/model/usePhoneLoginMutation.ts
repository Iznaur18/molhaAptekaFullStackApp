import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authMeQueryKeys, cartQueryKeys } from "@/shared/api";

import {
  confirmLoginPhoneOtp,
  loginUserByPhonePassword,
} from "../api/phoneAuth";
import { fetchAuthMe } from "../api/fetchAuthMe";

export type PhoneLoginPasswordParams = {
  method: "password";
  phoneNumber: string;
  password: string;
};

export type PhoneLoginOtpParams = {
  method: "otp";
  phoneNumber: string;
  code: string;
};

export type PhoneLoginParams = PhoneLoginPasswordParams | PhoneLoginOtpParams;

export const usePhoneLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: PhoneLoginParams) => {
      if (params.method === "password") {
        await loginUserByPhonePassword({
          phoneNumber: params.phoneNumber,
          password: params.password,
        });
      } else {
        await confirmLoginPhoneOtp({
          phoneNumber: params.phoneNumber,
          code: params.code,
        });
      }
      return fetchAuthMe();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(authMeQueryKeys.all, data);
      void queryClient.invalidateQueries({ queryKey: cartQueryKeys.all });
    },
  });
};
