import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { loyaltyPointsQueryKeys } from "@/shared/api";

import {
  fetchUsersLoyaltyRaffleSettings,
  patchUsersLoyaltyRaffleSettings,
  type PatchUsersLoyaltyRaffleSettingsBody,
} from "../api/usersLoyaltyRaffleApi";

export const usersLoyaltyRaffleQueryKeys = {
  all: ["users-loyalty-raffle"] as const,
  settings: () => [...usersLoyaltyRaffleQueryKeys.all, "settings"] as const,
};

export const useUsersLoyaltyRaffleSettingsQuery = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: usersLoyaltyRaffleQueryKeys.settings(),
    queryFn: fetchUsersLoyaltyRaffleSettings,
    enabled: options?.enabled ?? true,
  });

export const usePatchUsersLoyaltyRaffleSettingsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: PatchUsersLoyaltyRaffleSettingsBody) =>
      patchUsersLoyaltyRaffleSettings(body),
    onSuccess: (settings) => {
      queryClient.setQueryData(usersLoyaltyRaffleQueryKeys.settings(), settings);
      void queryClient.invalidateQueries({
        queryKey: loyaltyPointsQueryKeys.monthlyAwarded(),
      });
    },
  });
};
