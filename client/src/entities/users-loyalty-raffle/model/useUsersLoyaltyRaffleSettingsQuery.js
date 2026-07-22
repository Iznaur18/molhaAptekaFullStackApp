import { useQuery } from "@tanstack/react-query";

import { fetchUsersLoyaltyRaffleSettings } from "../api/usersLoyaltyRaffleApi.js";
import { usersLoyaltyRaffleQueryKeys } from "./usersLoyaltyRaffleQueryKeys.js";

/**
 * @param {{ enabled?: boolean }} [options]
 */
export function useUsersLoyaltyRaffleSettingsQuery(options = {}) {
  return useQuery({
    queryKey: usersLoyaltyRaffleQueryKeys.settings(),
    queryFn: fetchUsersLoyaltyRaffleSettings,
    enabled: options.enabled ?? true,
  });
}
