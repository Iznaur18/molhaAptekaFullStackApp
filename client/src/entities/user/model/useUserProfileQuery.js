import { useQuery } from "@tanstack/react-query";

import { fetchUserProfileById } from "../api/fetchUserProfileById.js";
import { userProfileQueryKeys } from "./userProfileQueryKeys.js";

/**
 * @param {{ userId: string; enabled?: boolean }} params
 */
export function useUserProfileQuery({ userId, enabled = true }) {
  return useQuery({
    queryKey: userProfileQueryKeys.byId(userId),
    enabled: enabled && Boolean(userId),
    queryFn: () => fetchUserProfileById(userId),
  });
}
