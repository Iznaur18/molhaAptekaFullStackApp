import { useMutation, useQueryClient } from "@tanstack/react-query";

import { patchUsersLoyaltyRaffleSettings } from "../api/usersLoyaltyRaffleApi.js";
import { usersLoyaltyRaffleQueryKeys } from "./usersLoyaltyRaffleQueryKeys.js";

export function usePatchUsersLoyaltyRaffleSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchUsersLoyaltyRaffleSettings,
    onSuccess: (settings) => {
      queryClient.setQueryData(usersLoyaltyRaffleQueryKeys.settings(), settings);
    },
  });
}
