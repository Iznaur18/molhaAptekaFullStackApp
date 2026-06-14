import { useQuery } from "@tanstack/react-query";

import { fetchUserProfileById } from "../api/fetchUserProfileById";
import { userProfileQueryKeys } from "./userProfileQueryKeys";

type UseUserProfileQueryOptions = {
  userId: string;
  enabled?: boolean;
};

export const useUserProfileQuery = ({ userId, enabled = true }: UseUserProfileQueryOptions) => {
  return useQuery({
    queryKey: userProfileQueryKeys.byId(userId),
    enabled: enabled && Boolean(userId),
    queryFn: () => fetchUserProfileById(userId),
  });
};
