import { useMutation, useQueryClient } from "@tanstack/react-query";

import { usersMonthlyLoyaltyQueryKeys } from "../../user/model/usersMonthlyLoyaltyQueryKeys.js";
import { resetUsersLoyaltyRaffleProgress } from "../api/usersLoyaltyRaffleApi.js";
import { usersLoyaltyRaffleQueryKeys } from "./usersLoyaltyRaffleQueryKeys.js";

export function useResetUsersLoyaltyRaffleProgressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resetUsersLoyaltyRaffleProgress,
    onSuccess: (result) => {
      if (result?.settings) {
        queryClient.setQueryData(
          usersLoyaltyRaffleQueryKeys.settings(),
          result.settings,
        );
      }
      void queryClient.invalidateQueries({
        queryKey: usersMonthlyLoyaltyQueryKeys.all,
      });
    },
  });
}
