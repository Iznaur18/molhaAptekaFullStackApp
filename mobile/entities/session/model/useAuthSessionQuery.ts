import { useQuery } from "@tanstack/react-query";

import { authMeQueryKeys, getAccessToken } from "@/shared/api";
import { AUTH_ME_STALE_TIME_MS } from "@/shared/config";

import { fetchAuthMe } from "../api/fetchAuthMe";

export const useAuthSessionQuery = () => {
  return useQuery({
    queryKey: authMeQueryKeys.all,
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token) {
        return null;
      }
      return fetchAuthMe();
    },
    staleTime: AUTH_ME_STALE_TIME_MS,
    retry: false,
  });
};
